<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Base64url decode to binary string
 */
function base64url_decode($data) {
    $base64 = strtr($data, '-_', '+/');
    return base64_decode($base64);
}

/**
 * Decrypt AES-GCM encrypted data
 */
function decryptAESGCM($key_parts, $payload_b64, $iv_b64) {
    try {
        // Combine key parts
        $combined = '';
        foreach ($key_parts as $part) {
            $combined .= base64url_decode($part);
        }
        $key = substr($combined, 0, 32);
        
        // Decode payload and IV
        $payload = base64url_decode($payload_b64);
        $iv = base64url_decode($iv_b64);
        
        // In AES-GCM, the last 16 bytes of the payload are the authentication tag
        $tag_length = 16; // 128 bits
        $ciphertext = substr($payload, 0, -$tag_length);
        $tag = substr($payload, -$tag_length);
        
        // Decrypt using OpenSSL
        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );
        
        if ($plaintext === false) {
            throw new Exception('Decryption failed: ' . openssl_error_string());
        }
        
        return $plaintext;
    } catch (Exception $e) {
        throw new Exception('Decryption error: ' . $e->getMessage());
    }
}

// Main execution
try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    if (!isset($input['key_parts']) || !isset($input['payload']) || !isset($input['iv'])) {
        throw new Exception('Missing required fields: key_parts, payload, iv');
    }
    
    // Decrypt
    $decrypted = decryptAESGCM(
        $input['key_parts'],
        $input['payload'],
        $input['iv']
    );
    
    // Try to parse as JSON
    $json = json_decode($decrypted, true);
    if ($json !== null) {
        echo json_encode([
            'success' => true,
            'data' => $json
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => $decrypted
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
