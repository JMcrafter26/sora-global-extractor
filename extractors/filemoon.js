
async function extractStreamUrl(url) {
    try {

        let uas = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
            "Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
        ];
        let headers = {
            "User-Agent": uas[(url.length) % uas.length], // use a different user agent based on the url and provider
            "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": url,
            "Connection": "keep-alive",
            "x-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
        };

        const response = await soraFetch(url, { headers });
        const html = await response.text();


        let streamUrl = null;
        try {
            streamUrl = await filemoonExtractor(html, url);
        } catch (error) {
            console.log("filemoon HD extraction error:" + error);
        }

        console.log("filemoon Stream URL: " + streamUrl);
        if (streamUrl && streamUrl !== false && streamUrl !== null) {
            return streamUrl;
        }

        console.log("No stream URL found");

        return null;
    } catch (error) {
        console.log("Fetch error: " + error);
        return null;
    }
}

/* SCHEME START */

/**
 * @name filemoonExtractor
 * @author Cufiy
 */
async function filemoonExtractor(html, url = null) {
    let uas = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
        "Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
    ];
    let headers = {
        "User-Agent": uas[(url.length) % uas.length], // use a different user agent based on the url and provider
        "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": url,
        "Connection": "keep-alive",
        "x-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
    };
    console.log("Initial URL: " + url);
    // if urs does not contain /d/ or /e/, follow the redirect to get the correct url
    if (url && !url.match(/\/[de]\//)) {
        const response = await soraFetch(url, { headers, method: 'HEAD' });
        // console log everything
        // console.log("Response object from redirect fetch:" + JSON.stringify(response));
        console.log("Redirected URL: " + response.url);
        if (response.url) {
            url = response.url;
        } else {
            console.log("Could not follow redirect to get video ID, using proxy failback");
            const proxyResponseRaw = await soraFetch('https://passthrough-worker.simplepostrequest.workers.dev/noredirect?url=' + encodeURIComponent(url), { headers });
            let proxyResponse;
            try {
                proxyResponse = await proxyResponseRaw.json() || await JSON.parse(proxyResponseRaw);
                console.log("Proxy Response: " + JSON.stringify(proxyResponse));
            } catch (error) {
              console.log("Error parsing proxy response as JSON: " + error);
                return null;
            }
            console.log("Proxy Redirected URL: " + proxyResponse.location);
            if (proxyResponse.location) {
                url = proxyResponse.location;
            } else {
                console.log("No redirect URL found from proxy");
                return null;
            }
        }
    }

    // get id from url, e.g. https://filemoon.to/d/xxx or https://filemoon.to/e/xxx
    const idMatch = url ? url.match(/\/[de]\/([a-zA-Z0-9]+)/) : null;
    const videoId = idMatch ? idMatch[1] : null;
    console.log("Extracted video ID: " + videoId);
    if (!videoId) {
        throw new Error("No video ID found in URL");
        console.log("No video ID found in URL");
        return null;
    }
    const apiUrl = `https://filemoon.to/api/videos/${videoId}/playback`;;
    try {
        const response = await soraFetch(apiUrl, { headers });
        const json = await response.json();
        const decryptor = new FileMoonDecryptor(json);
        const decrypted = await decryptor.decrypt();
        // Check for sources
        if (decrypted && decrypted.sources) {
            // Find the first source with a valid URL
            for (const source of decrypted.sources) {
                if (source.url) {
                    console.log("Found source URL: " + source.url);
                    return source.url;
                }
            }
        }
        console.log("No sources found in decrypted data");
        return null;
    } catch (error) {
        console.log("filemoon API fetch error: " + error);
        return null;
    }
}


class FileMoonDecryptor {
    constructor(data) { this.d = data.playback; }
    
    // Base64url decode to byte array
    b64d(s) {
        const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(b64);
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i);
        }
        return bytes;
    }
    
    // Concatenate Uint8Arrays
    concatBytes(...arrays) {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }
    
    async decrypt() {
        console.log('Analyzing encryption...');
        
        try {
            // Call PHP backend for decryption
            // Please note: This is a workaround since the decryption logic is complex and may rely on environment-specific features.
            // This endpoint is open-sourced and can be self-hosted if needed, just take a look at the `decryptAESGCM.js` file in this folder.
            const phpEndpoint = 'https://api.jm26.net/decryptAESGCM/';
            
            const response = await soraFetch(phpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key_parts: this.d.key_parts,
                    payload: this.d.payload,
                    iv: this.d.iv
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Decryption failed on server');
            }
            
            console.log('\n✅ Decrypted using PHP backend');
            console.log('Parsed JSON structure:');
            console.log(JSON.stringify(result.data, null, 2));
            
            return result.data;
        } catch(e) {
            console.log('❌ Decryption failed:', e.message);
            throw e;
        }
    }
}



/* REMOVE_START */


/**
 * Uses Sora's fetchv2 on ipad, fallbacks to regular fetch on Windows
 * @author ShadeOfChaos
 *
 * @param {string} url The URL to make the request to.
 * @param {object} [options] The options to use for the request.
 * @param {object} [options.headers] The headers to send with the request.
 * @param {string} [options.method='GET'] The method to use for the request.
 * @param {string} [options.body=null] The body of the request.
 *
 * @returns {Promise<Response|null>} The response from the server, or null if the
 * request failed.
 */
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch (e) {
        try {
            return await fetch(url, options);
        } catch (error) {
            return null;
        }
    }
}
/* REMOVE_END */

/* SCHEME END */
