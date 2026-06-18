// ⚠️ DO NOT EDIT BELOW THIS LINE ⚠️
// EDITING THIS FILE COULD BREAK THE UPDATER AND CAUSE ISSUES WITH THE EXTRACTOR

/* {GE START} */
/* {VERSION: 1.2.1} */

/**
 * @name global_extractor.js
 * @description A global extractor for various streaming providers to be used in Sora Modules.
 * @author Cufiy
 * @url https://github.com/JMcrafter26/sora-global-extractor
 * @license CUSTOM LICENSE - see https://github.com/JMcrafter26/sora-global-extractor/blob/main/LICENSE
 * @date 2026-04-22 20:51:39
 * @version 1.2.1
 * @note This file was generated automatically.
 * The global extractor comes with an auto-updating feature, so you can always get the latest version. https://github.com/JMcrafter26/sora-global-extractor#-auto-updater
 */


/* {GE TEMPLATE FUNCTION START} */
async function extractStreamUrl(url) {
  try {
    let providers = {};

    // Logic to populate providers
    // ...
    // Note: The higher up the provider is in the list, the higher the priority
    // Available providers: filemoon, voe

    // E.g.
    // providers = {
    //   "https://vidmoly.to/embed-4321bca.html": "vidmoly",
    //   "https://speedfiles.net/1234abc": "speedfiles",
    //   "https://example.com/video.mp4": "direct-SomeName", // this will add the url to the streams array directly, you can customize the name after the "direct-" prefix
    //   "https://speedfiles.net/9876bca": "speedfiles-2", // you can also add a name or a number to the provider, this will be used as the name in the streams array
    // };

    // Choose one of the following:

    // Multiple extractor (recommended)
    let streams = [];
    try {
      streams = await multiExtractor(providers);
      let returnedStreams = {
        streams: streams,
      };

      console.log(
        "Multi extractor streams: " + JSON.stringify(returnedStreams)
      );
      return JSON.stringify(returnedStreams);
    } catch (error) {
      console.log("Multi extractor error:" + error);
      return JSON.stringify([{ provider: "Error2", link: "" }]);
    }

    // Single extractor
    let streamUrl = null;
    try {
      streamUrl = globalExtractor(providers);
    } catch (error) {
      console.log("Global extractor error:" + error);
      return null;
    }

    if (!streamUrl) {
      throw new Error("Stream URL not found");
    }
    return streamUrl;
  } catch (error) {
    console.log("Fetch error:", error);
    return null;
  }
}
/* {GE TEMPLATE FUNCTION END} */

function globalExtractor(providers) {
  for (const [url, provider] of Object.entries(providers)) {
    try {
      const streamUrl = extractStreamUrlByProvider(url, provider);
      // check if streamUrl is an object with streamUrl property
      if (streamUrl && typeof streamUrl === "object" && !Array.isArray(streamUrl) && streamUrl.streamUrl) {
        return streamUrl.streamUrl;
      }
      // check if streamUrl is not null, a string, and starts with http or https
      if (
        streamUrl &&
        typeof streamUrl === "string" &&
        streamUrl.startsWith("http")
      ) {
        return streamUrl;
        // if its an array, get the value that starts with http
      } else if (Array.isArray(streamUrl)) {
        const httpStream = streamUrl.find((url) => url.startsWith("http"));
        if (httpStream) {
          return httpStream;
        }
      } else if (streamUrl || typeof streamUrl !== "string") {
        // check if it's a valid stream URL
        return null;
      }
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return null;
}

async function multiExtractor(providers) {
  /* this scheme should be returned as a JSON object
  {
  "streams": [
  {
    "title": "FileMoon",
    "streamUrl": "https://filemoon.example/stream1.m3u8",
  },
  {
    "title": "StreamWish",
    "streamUrl": "https://streamwish.example/stream2.m3u8",
  },
  {
    "title": "Okru",
    "streamUrl": "https://okru.example/stream3.m3u8",
    "headers": { // Optional headers for the stream
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      "Referer": "https://okru.example/",
    },
  },
  {
    "title": "MP4",
    "streamUrl": "https://mp4upload.example/stream4.mp4",
  },
  {
    "title": "Default",
    "streamUrl": "https://default.example/stream5.m3u8"
  }
  ]
}
  */

  const streams = [];
  const providersCount = {};
  for (let [url, provider] of Object.entries(providers)) {
    try {
      // if provider starts with "direct-", then add the url to the streams array directly
      if (provider.startsWith("direct-")) {
        const directName = provider.slice(7); // remove "direct-" prefix
        const title = (directName && directName.length > 0) ? directName : "Direct";
        streams.push({
          title: title,
          streamUrl: url
        });
        continue; // skip to the next provider
      }
      if (provider.startsWith("direct")) {
        provider = provider.slice(7); // remove "direct-" prefix
        const title = (provider && provider.length > 0) ? provider : "Direct";
        streams.push({
          title: title,
          streamUrl: url
        });
        continue; // skip to the next provider
      }

      let customName = null; // to store the custom name if provided

      // if the provider has - then split it and use the first part as the provider name
      if (provider.includes("-")) {
        const parts = provider.split("-");
        provider = parts[0]; // use the first part as the provider name
        customName = parts.slice(1).join("-"); // use the rest as the custom name
      }

      // check if providercount is not bigger than 3
      if (providersCount[provider] && providersCount[provider] >= 3) {
        console.log(`Skipping ${provider} as it has already 3 streams`);
        continue;
      }
      let result = await extractStreamUrlByProvider(url, provider);
      let streamUrl = null;
      let headers = null;

      // Check if result is an object with streamUrl and optional headers
      if (result && typeof result === "object" && !Array.isArray(result) && result.streamUrl) {
        streamUrl = result.streamUrl;
        headers = result.headers || null;
      } else if (result && Array.isArray(result)) {
        const httpStream = result.find((url) => url.startsWith("http"));
        if (httpStream) {
          streamUrl = httpStream;
        }
      } else if (result && typeof result === "string") {
        streamUrl = result;
      }

      // check if streamUrl is valid
      if (
        !streamUrl ||
        typeof streamUrl !== "string" ||
        !streamUrl.startsWith("http")
      ) {
        continue; // skip if streamUrl is not valid
      }

      // if customName is defined, use it as the name
      if (customName && customName.length > 0) {
        provider = customName;
      }

      let title;
      if (providersCount[provider]) {
        providersCount[provider]++;
        title = provider.charAt(0).toUpperCase() +
            provider.slice(1) +
            "-" +
            (providersCount[provider] - 1); // add a number to the provider name
      } else {
        providersCount[provider] = 1;
        title = provider.charAt(0).toUpperCase() + provider.slice(1);
      }
      
      const streamObject = {
        title: title,
        streamUrl: streamUrl
      };
      
      // Add headers if they exist
      if (headers && typeof headers === "object" && Object.keys(headers).length > 0) {
        streamObject.headers = headers;
      }
      
      streams.push(streamObject);
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return streams;
}

async function extractStreamUrlByProvider(url, provider) {
  if (eval(`typeof ${provider}Extractor`) !== "function") {
    // skip if the extractor is not defined
    console.log(
      `Extractor for provider ${provider} is not defined, skipping...`
    );
    return null;
  }
  let uas = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
  ];
  let headers = {
    "User-Agent": uas[(url.length + provider.length) % uas.length], // use a different user agent based on the url and provider
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": url,
    "Connection": "keep-alive",
    "x-Requested-With": "XMLHttpRequest",
  };

  switch (provider) {
    case "bigwarp":
      delete headers["User-Agent"];
      break;
    case "vk":
    case "sibnet":
      headers["encoding"] = "windows-1251"; // required
      break;
    case "supervideo":
    case "savefiles":
        headers = {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "User-Agent": "EchoapiRuntime/1.1.0",
                "Connection": "keep-alive",
                "Cache-Control": "no-cache",
                "Host": url.match(/https?:\/\/([^\/]+)/)[1],
            };
      break;
    case "streamtape":
      headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      };
      break;
  }
  // console.log("Using headers: " + JSON.stringify(headers));

  // fetch the url
  // and pass the response to the extractor function
  console.log("Fetching URL: " + url);
  const response = await soraFetch(url, {
    headers,
  });

  console.log("Response: " + response.status);
  let html = response.text ? await response.text() : response;
  // if title contains redirect, then get the redirect url
  const title = html.match(/<title>(.*?)<\/title>/);
  if (title && title[1].toLowerCase().includes("redirect")) {
    const matches = [
      /<meta http-equiv="refresh" content="0;url=(.*?)"/,
      /window\.location\.href\s*=\s*["'](.*?)["']/,
      /window\.location\.replace\s*\(\s*["'](.*?)["']\s*\)/,
      /window\.location\s*=\s*["'](.*?)["']/,
      /window\.location\.assign\s*\(\s*["'](.*?)["']\s*\)/,
      /top\.location\s*=\s*["'](.*?)["']/,
      /top\.location\.replace\s*\(\s*["'](.*?)["']\s*\)/,
    ];
    for (const match of matches) {
      const redirectUrl = html.match(match);
      if (redirectUrl && redirectUrl[1] && typeof redirectUrl[1] === "string" && redirectUrl[1].startsWith("http")) {
        console.log("Redirect URL found: " + redirectUrl[1]);
        url = redirectUrl[1];
        headers['Referer'] = url;
        headers['Host'] = url.match(/https?:\/\/([^\/]+)/)[1];
        html = await soraFetch(url, {
          headers,
        }).then((res) => res.text());
        break;
      }
    }
  }

  // console.log("HTML: " + html);
  switch (provider) {
        case "filemoon":
      try {
         return await filemoonExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from filemoon:", error);
         return null;
      }
    case "voe":
      try {
         return await voeExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from voe:", error);
         return null;
      }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}



////////////////////////////////////////////////
//                 EXTRACTORS                 //
////////////////////////////////////////////////

// DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING //


/* --- filemoon --- */

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




/* --- voe --- */

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
  // console.log("Decoded JSON:", result);
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




////////////////////////////////////////////////
//                 PLUGINS                    //
////////////////////////////////////////////////

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
async function soraFetch(
  url,
  options = { headers: {}, method: "GET", body: null }
) {
  try {
    return await fetchv2(
      url,
      options.headers ?? {},
      options.method ?? "GET",
      options.body ?? null
    );
  } catch (e) {
    try {
      return await fetch(url, options);
    } catch (error) {
      await console.log("soraFetch error: " + error.message);
      return null;
    }
  }
}

/* {PLUGINS} */

/* {GE END} */
