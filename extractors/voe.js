async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    
    let streamData = null;
    try {
      streamData = voeExtractor(html);
    } catch (error) {
      console.log("VOE extraction error:", error);
      return null;
    }

    // You may want to adjust this depending on the actual structure
    if (streamData && typeof streamData === "object") {
      // Try to find a stream URL in the result
      const streamUrl =
        streamData.direct_access_url ||
        streamData.source
          .map((source) => source.direct_access_url)
          .find((url) => url && url.startsWith("http"));
      if (streamUrl) {
        console.log("Voe Stream URL: " + streamUrl);
        return streamUrl;
      }
      console.log("No stream URL found in the decoded JSON");
      return null;
    }

    console.log("No stream URL found");
    return null;
  } catch (error) {
    console.log("Fetch error:", error);
    return null;
  }
}

/* SCHEME START */

/**
 * @name voeExtractor
 * @author Cufiy
 */

function voeExtractor(html, url = null) {
// Extract the first <script type="application/json">...</script>
    const jsonScriptMatch = html.match(
      /<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    if (!jsonScriptMatch) {
      console.log("No application/json script tag found");
      return null;
    }


    const obfuscatedJson = jsonScriptMatch[1].trim();

  let data;
  try {
    data = JSON.parse(obfuscatedJson);
  } catch (e) {
    throw new Error("Invalid JSON input.");
  }
  if (!Array.isArray(data) || typeof data[0] !== "string") {
    throw new Error("Input doesn't match expected format.");
  }
  let obfuscatedString = data[0];

  // Step 1: ROT13
  let step1 = voeRot13(obfuscatedString);

  // Step 2: Remove patterns
  let step2 = voeRemovePatterns(step1);

  // Step 3: Base64 decode
  let step3 = voeBase64Decode(step2);

  // Step 4: Subtract 3 from each char code
  let step4 = voeShiftChars(step3, 3);

  // Step 5: Reverse string
  let step5 = step4.split("").reverse().join("");

  // Step 6: Base64 decode again
  let step6 = voeBase64Decode(step5);

  // Step 7: Parse as JSON
  let result;
  try {
    result = JSON.parse(step6);
  } catch (e) {
    throw new Error("Final JSON parse error: " + e.message);
  }
  console.log("Decoded JSON:", result);

  // check if direct_access_url is set, not null and starts with http
  if (result && typeof result === "object") {
    const streamUrl =
      result.direct_access_url ||
      result.source
        .map((source) => source.direct_access_url)
        .find((url) => url && url.startsWith("http"));
    if (streamUrl) {
      console.log("Voe Stream URL: " + streamUrl);
      return streamUrl;
    } else {
      console.log("No stream URL found in the decoded JSON");
    }
  }
  return result;
}

function voeRot13(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode(
      (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13)
        ? c
        : c - 26
    );
  });
}

function voeRemovePatterns(str) {
  const patterns = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
  let result = str;
  for (const pat of patterns) {
    result = result.split(pat).join("");
  }
  return result;
}

function voeBase64Decode(str) {
  // atob is available in browsers and Node >= 16
  if (typeof atob === "function") {
    return atob(str);
  }
  // Node.js fallback
  return Buffer.from(str, "base64").toString("utf-8");
}

function voeShiftChars(str, shift) {
  return str
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) - shift))
    .join("");
}

/* SCHEME END */