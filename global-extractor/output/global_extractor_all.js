/* WARNING: This file contains all the extractors, working and not working and is not recommended to be used. */
// ⚠️ DO NOT EDIT BELOW THIS LINE ⚠️
// EDITING THIS FILE COULD BREAK THE UPDATER AND CAUSE ISSUES WITH THE EXTRACTOR

/* {GE START} */
/* {VERSION: 1.2.2} */

/**
 * @name global_extractor.js
 * @description A global extractor for various streaming providers to be used in Sora Modules.
 * @author Cufiy
 * @url https://github.com/JMcrafter26/sora-global-extractor
 * @license CUSTOM LICENSE - see https://github.com/JMcrafter26/sora-global-extractor/blob/main/LICENSE
 * @date 2026-06-18 02:27:54
 * @version 1.2.2
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
    // Available providers: bigwarp, dailymotion, doodstream, earnvids, filemoon, fourshared, lulustream, megacloud, mp4upload, oneupload, packer, playerwish, savefiles, sendvid, sibnet, smoothpre, streamhg, streamtape, streamup, streamwish, supervideo, uploadcx, uqload, videospk, vidmoly, vidoza, vk, voe

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

  // node debug, save the html to a file in debug folder
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    const fs = require("fs");
    const path = require("path");
    const debugFolder = path.join(__dirname, "debug");
    if (!fs.existsSync(debugFolder)) {
      fs.mkdirSync(debugFolder);
    }
    const filePath = path.join(debugFolder, `${provider}_response.html`);
    fs.writeFileSync(filePath, html);
    console.log(`Response HTML saved to ${filePath}`);
  }


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
        case "bigwarp":
      try {
         return await bigwarpExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from bigwarp:", error);
         return null;
      }
    case "dailymotion":
      try {
         return await dailymotionExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from dailymotion:", error);
         return null;
      }
    case "doodstream":
      try {
         return await doodstreamExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from doodstream:", error);
         return null;
      }
    case "earnvids":
      try {
         return await earnvidsExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from earnvids:", error);
         return null;
      }
    case "filemoon":
      try {
         return await filemoonExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from filemoon:", error);
         return null;
      }
    case "fourshared":
      try {
         return await foursharedExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from fourshared:", error);
         return null;
      }
    case "lulustream":
      try {
         return await lulustreamExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from lulustream:", error);
         return null;
      }
    case "megacloud":
      try {
         return await megacloudExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from megacloud:", error);
         return null;
      }
    case "mp4upload":
      try {
         return await mp4uploadExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from mp4upload:", error);
         return null;
      }
    case "oneupload":
      try {
         return await oneuploadExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from oneupload:", error);
         return null;
      }
    case "packer":
      try {
         return await packerExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from packer:", error);
         return null;
      }
    case "playerwish":
      try {
         return await playerwishExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from playerwish:", error);
         return null;
      }
    case "savefiles":
      try {
         return await savefilesExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from savefiles:", error);
         return null;
      }
    case "sendvid":
      try {
         return await sendvidExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from sendvid:", error);
         return null;
      }
    case "sibnet":
      try {
         return await sibnetExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from sibnet:", error);
         return null;
      }
    case "smoothpre":
      try {
         return await smoothpreExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from smoothpre:", error);
         return null;
      }
    case "streamhg":
      try {
         return await streamhgExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from streamhg:", error);
         return null;
      }
    case "streamtape":
      try {
         return await streamtapeExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from streamtape:", error);
         return null;
      }
    case "streamup":
      try {
         return await streamupExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from streamup:", error);
         return null;
      }
    case "streamwish":
      try {
         return await streamwishExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from streamwish:", error);
         return null;
      }
    case "supervideo":
      try {
         return await supervideoExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from supervideo:", error);
         return null;
      }
    case "uploadcx":
      try {
         return await uploadcxExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from uploadcx:", error);
         return null;
      }
    case "uqload":
      try {
         return await uqloadExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from uqload:", error);
         return null;
      }
    case "videospk":
      try {
         return await videospkExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from videospk:", error);
         return null;
      }
    case "vidmoly":
      try {
         return await vidmolyExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from vidmoly:", error);
         return null;
      }
    case "vidoza":
      try {
         return await vidozaExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from vidoza:", error);
         return null;
      }
    case "vk":
      try {
         return await vkExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from vk:", error);
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


/* --- bigwarp --- */

/**
 * 
 * @name bigWarpExtractor
 * @author Cufiy
 */
async function bigwarpExtractor(videoPage, url = null) {

  // regex get 'sources: [{file:"THIS_IS_THE_URL" ... '
  const scriptRegex = /sources:\s*\[\{file:"([^"]+)"/;
  // const scriptRegex =
  const scriptMatch = scriptRegex.exec(videoPage);
  const bwDecoded = scriptMatch ? scriptMatch[1] : false;
  console.log("BigWarp HD Decoded:", bwDecoded);
  return bwDecoded;
}


/* --- dailymotion --- */

/**
 * @name dailymotionExtractor
 * @author 50/50
 */
async function dailymotionExtractor(html, url = null) {
    try {
        let videoId = null;
        const patterns = [
            /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,          
            /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,    
            /[?&]video=([a-zA-Z0-9]+)/                          
        ];
        for (const p of patterns) {
            const match = url.match(p);
            if (match) {
                videoId = match[1];
                break;
            }
        }
        if (!videoId) {
            console.log("Invalid Dailymotion URL");
            return JSON.stringify({ streams: [], subtitles: "" });
        }
        const metaRes = await soraFetch(`https://www.dailymotion.com/player/metadata/video/${videoId}`);
        const metaJson = await metaRes.json ? await metaRes.json() : JSON.parse(await metaRes);
        const hlsLink = metaJson.qualities?.auto?.[0]?.url;
        if (!hlsLink) return JSON.stringify({ streams: [], subtitles: "" });
        async function getBestHls(hlsUrl) {
            try {
                const res = await soraFetch(hlsUrl);
                const text = await res.text();
                const regex = /#EXT-X-STREAM-INF:.*RESOLUTION=(\d+)x(\d+).*?\n(https?:\/\/[^\n]+)/g;
                const streams = [];
                let match;
                while ((match = regex.exec(text)) !== null) {
                    streams.push({ width: parseInt(match[1]), height: parseInt(match[2]), url: match[3] });
                }
                if (streams.length === 0) return hlsUrl;
                streams.sort((a, b) => b.height - a.height);
                return streams[0].url;
            } catch {
                return hlsUrl;
            }
        }
        const bestHls = await getBestHls(hlsLink);
        return bestHls;
        const subtitles = metaJson.subtitles?.data?.['en-auto']?.urls?.[0] || "";
        const result = {
            streams: ["1080p", bestHls],
            subtitles: subtitles
        };
        console.log("Extracted Dailymotion result:" + JSON.stringify(result));
        return JSON.stringify(result);
    } catch {
        const empty = { streams: [], subtitles: "" };
        console.log("Extracted Dailymotion result:" + JSON.stringify(empty));
        return JSON.stringify(empty);
    }
}



/* --- doodstream --- */

/**
 * @name doodstreamExtractor
 * @author Cufiy
 */
async function doodstreamExtractor(html, url = null) {
    console.log("DoodStream extractor called");
    console.log("DoodStream extractor URL: " + url);
    const match = html.match(/\/pass_md5\/([a-fA-F0-9\-]+)\/([a-zA-Z0-9]+)/);
    if (!match) {
        console.log('Could not find hash/token in the page.');
        return;
    }
    const hash = match[1];
    const token = match[2];
    console.log('🔑 Hash:', hash, 'Token:', token);
    const hostUrl = url.match(/https?:\/\/[^\/]+/)[0];
    // 2. Request the base video URL
    const request = await soraFetch(`${hostUrl}/pass_md5/${hash}/${token}`);
    if (!request) {
        console.error('Failed to fetch the base video URL.');
        return;
    }
    const data = await request.text();

    if (!data) {
        console.error('Failed to fetch the base video URL.');
        return;
    }
    if (data.trim() === 'RELOAD') {
        console.error('Token expired or invalid. Received RELOAD response.');
        return;
    }
    let baseUrl = data.trim();
    // If the server returns a relative path, make it absolute
    if (!baseUrl.startsWith('http')) {
        baseUrl = hostUrl + baseUrl;
    }
    console.log('🎬 Base video URL:', baseUrl);
    // 3. Replicate makePlay() – random 10 chars + token + expiry
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < 10; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const suffix = randomStr + '?token=' + token + '&expiry=' + Date.now();
    const finalUrl = baseUrl + suffix;
    console.log('Final video URL:', finalUrl);
    return finalUrl;
}


/* --- earnvids --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name earnvidsExtractor
 * @author 50/50
 */
async function earnvidsExtractor(html, url = null) {
    try {
        const obfuscatedScript = html.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
        const unpackedScript = unpack(obfuscatedScript[1]);
        const streamMatch = unpackedScript.match(/["'](\/stream\/[^"']+)["']/);
        const hlsLink = streamMatch ? streamMatch[1] : null;
        const baseUrl = url.match(/^(https?:\/\/[^/]+)/)[1];
        console.log("HLS Link:" + baseUrl + hlsLink);
        return baseUrl + hlsLink;
    } catch (err) {
        console.log(err);
        return "https://files.catbox.moe/avolvc.mp4";
    }
}



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




/* --- fourshared --- */

/**
 * @name foursharedExtractor
 * @author 50/50
 */
async function foursharedExtractor(data, url = null) {
    try {
        // Try to extract from iframe embed first
        const match = data.match(/<iframe[^>]+src="(https:\/\/www\.4shared\.com\/web\/embed\/file\/[^"]+)"/i);
        if (match && match[1]) {
            const videoEmbedUrl = match[1].trim();
            const response2 = await soraFetch(videoEmbedUrl);
            const html2 = await response2.text();
            const match2 = html2.match(/<source[^>]+src="([^"]+)"[^>]*type="video\/mp4"/i);
            if (match2 && match2[1]) {
                return match2[1].trim();
            }
        }
        // Fallback: try to extract directly from the page
        const match2 = data.match(/<source[^>]+src="([^"]+)"[^>]*type="video\/mp4"/i);
        return match2 && match2[1] ? match2[1].trim() : "No stream found";
    } catch (error) {
        console.log("extract4Shared error:", error);
        return "No stream found";
    }
}


/* --- lulustream --- */

/**
 * @name LuluStream Extractor
 * @author Cufiy
 */
async function lulustreamExtractor(data, url = null) {
  const scriptRegex = /sources:\s*\[\{file:"([^"]+)"/;
  const scriptMatch = scriptRegex.exec(data);
  const decoded = scriptMatch ? scriptMatch[1] : false;
  return decoded;
}


/* --- megacloud --- */

/**
 * @name megacloudExtractor
 * @author ShadeOfChaos
 */

// Megacloud V3 specific
async function megacloudExtractor(html, embedUrl) {
	// TESTING ONLY START
	const testcase = '/api/static';
	if(embedUrl.slice(-testcase.length) == testcase) {
		try {
			const response = await soraFetch(embedUrl, { method: 'GET', headers: { "referer": "https://megacloud.blog/" } });
			embedUrl = response.url;
		} catch (error) {
			throw new Error("[TESTING ONLY] Megacloud extraction error:", error);
		}
	}
	// TESTING ONLY END
	const CHARSET = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32));
	const xraxParams = embedUrl.split('/').pop();
	const xrax = xraxParams.includes('?') ? xraxParams.split('?')[0] : xraxParams;
	const nonce = await getNonce(embedUrl);
	// return decrypt(secretKey, nonce, encryptedText);
	try {
		const response = await soraFetch(`https://megacloud.blog/embed-2/v3/e-1/getSources?id=${xrax}&_k=${nonce}`, { method: 'GET', headers: { "referer": "https://megacloud.blog/" } });
		const rawSourceData = await response.json();
		const encrypted = rawSourceData?.sources;
		let decryptedSources = null;
		// console.log('rawSourceData', rawSourceData);
		if (rawSourceData?.encrypted == false) {
			decryptedSources = rawSourceData.sources;
		}
		if (decryptedSources == null) {
			decryptedSources = await getDecryptedSourceV3(encrypted, nonce);
			if (!decryptedSources) throw new Error("Failed to decrypt source");
		}
		// console.log("Decrypted sources:" + JSON.stringify(decryptedSources, null, 2));
		// return the first source if it's an array
		if (Array.isArray(decryptedSources) && decryptedSources.length > 0) {
			try {
				return decryptedSources[0].file;
			} catch (error) {
				console.log("Error extracting MegaCloud stream URL:" + error);
				return false;
			}
		}
		// return {
		// 	status: true,
		// 	result: {
		// 		sources: decryptedSources,
		// 		tracks: rawSourceData.tracks,
		// 		intro: rawSourceData.intro ?? null,
		// 		outro: rawSourceData.outro ?? null,
		// 		server: rawSourceData.server ?? null
		// 	}
		// }
	} catch (error) {
		console.error(`[ERROR][decryptSources] Error decrypting ${embedUrl}:`, error);
		return {
			status: false,
			error: error?.message || 'Failed to get HLS link'
		};
	}
	/**
	 * Computes a key based on the given secret and nonce.
	 * The key is used to "unlock" the encrypted data.
	 * The computation of the key is based on the following steps:
	 * 1. Concatenate the secret and nonce.
	 * 2. Compute a hash value of the concatenated string using a simple
	 *    hash function (similar to Java's String.hashCode()).
	 * 3. Compute the remainder of the hash value divided by the maximum
	 *    value of a 64-bit signed integer.
	 * 4. Use the result as a XOR mask to process the characters of the
	 *    concatenated string.
	 * 5. Rotate the XOR-processed string by a shift amount equal to the
	 *    hash value modulo the length of the XOR-processed string plus 5.
	 * 6. Interleave the rotated string with the reversed nonce string.
	 * 7. Take a substring of the interleaved string of length equal to 96
	 *    plus the hash value modulo 33.
	 * 8. Convert each character of the substring to a character code
	 *    between 32 and 126 (inclusive) by taking the remainder of the
	 *    character code divided by 95 and adding 32.
	 * 9. Join the resulting array of characters into a string and return it.
	 * @param {string} secret - The secret string
	 * @param {string} nonce - The nonce string
	 * @returns {string} The computed key
	 */
	function computeKey(secret, nonce) {
		const secretAndNonce = secret + nonce;
		let hashValue = 0n;
		for (const char of secretAndNonce) {
			hashValue = BigInt(char.charCodeAt(0)) + hashValue * 31n + (hashValue << 7n) - hashValue;
		}
		const maximum64BitSignedIntegerValue = 0x7fffffffffffffffn;
		const hashValueModuloMax = hashValue % maximum64BitSignedIntegerValue;
		const xorMask = 247;
		const xorProcessedString = [...secretAndNonce]
			.map(char => String.fromCharCode(char.charCodeAt(0) ^ xorMask))
			.join('');
		const xorLen = xorProcessedString.length;
		const shiftAmount = (Number(hashValueModuloMax) % xorLen) + 5;
		const rotatedString = xorProcessedString.slice(shiftAmount) + xorProcessedString.slice(0, shiftAmount);
		const reversedNonceString = nonce.split('').reverse().join('');
		let interleavedString = '';
		const maxLen = Math.max(rotatedString.length, reversedNonceString.length);
		for (let i = 0; i < maxLen; i++) {
			interleavedString += (rotatedString[i] || '') + (reversedNonceString[i] || '');
		}
		const length = 96 + (Number(hashValueModuloMax) % 33);
		const partialString = interleavedString.substring(0, length);
		return [...partialString]
			.map(ch => String.fromCharCode((ch.charCodeAt(0) % 95) + 32))
			.join('');
	}
	/**
	 * Encrypts a given text using a columnar transposition cipher with a given key.
	 * The function arranges the text into a grid of columns and rows determined by the key length,
	 * fills the grid column by column based on the sorted order of the key characters,
	 * and returns the encrypted text by reading the grid row by row.
	 * 
	 * @param {string} text - The text to be encrypted.
	 * @param {string} key - The key that determines the order of columns in the grid.
	 * @returns {string} The encrypted text.
	 */
	function columnarCipher(text, key) {
		const columns = key.length;
		const rows = Math.ceil(text.length / columns);
		const grid = Array.from({ length: rows }, () => Array(columns).fill(''));
		const columnOrder = [...key]
			.map((char, idx) => ({ char, idx }))
			.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));
		let i = 0;
		for (const { idx } of columnOrder) {
			for (let row = 0; row < rows; row++) {
				grid[row][idx] = text[i++] || '';
			}
		}
		return grid.flat().join('');
	}
	/**
	 * Deterministically unshuffles an array of characters based on a given key phrase.
	 * The function simulates a pseudo-random shuffling using a numeric seed derived
	 * from the key phrase. This ensures that the same character array and key phrase
	 * will always produce the same output, allowing for deterministic "unshuffling".
	 * @param {Array} characters - The array of characters to unshuffle.
	 * @param {string} keyPhrase - The key phrase used to generate the seed for the 
	 *                             pseudo-random number generator.
	 * @returns {Array} A new array representing the deterministically unshuffled characters.
	 */
	function deterministicUnshuffle(characters, keyPhrase) {
		let seed = [...keyPhrase].reduce((acc, char) => (acc * 31n + BigInt(char.charCodeAt(0))) & 0xffffffffn, 0n);
		const randomNumberGenerator = (upperLimit) => {
			seed = (seed * 1103515245n + 12345n) & 0x7fffffffn;
			return Number(seed % BigInt(upperLimit));
		};
		const shuffledCharacters = characters.slice();
		for (let i = shuffledCharacters.length - 1; i > 0; i--) {
			const j = randomNumberGenerator(i + 1);
			[shuffledCharacters[i], shuffledCharacters[j]] = [shuffledCharacters[j], shuffledCharacters[i]];
		}
		return shuffledCharacters;
	}
	/**
	 * Decrypts an encrypted text using a secret key and a nonce through multiple rounds of decryption.
	 * The decryption process includes base64 decoding, character substitution using a pseudo-random 
	 * number generator, a columnar transposition cipher, and deterministic unshuffling of the character set.
	 * Finally, it extracts and parses the decrypted JSON string or verifies it using a regex pattern.
	 * 
	 * @param {string} secretKey - The key used to decrypt the text.
	 * @param {string} nonce - A nonce for additional input to the decryption key.
	 * @param {string} encryptedText - The text to be decrypted, encoded in base64.
	 * @param {number} [rounds=3] - The number of decryption rounds to perform.
	 * @returns {Object|null} The decrypted JSON object if successful, or null if parsing fails.
	 */
	function decrypt(secretKey, nonce, encryptedText, rounds = 3) {
		let decryptedText = Buffer.from(encryptedText, 'base64').toString('utf-8');
		const keyPhrase = computeKey(secretKey, nonce);
		for (let round = rounds; round >= 1; round--) {
			const encryptionPassphrase = keyPhrase + round;
			let seed = [...encryptionPassphrase].reduce((acc, char) => (acc * 31n + BigInt(char.charCodeAt(0))) & 0xffffffffn, 0n);
			const randomNumberGenerator = (upperLimit) => {
				seed = (seed * 1103515245n + 12345n) & 0x7fffffffn;
				return Number(seed % BigInt(upperLimit));
			};
			decryptedText = [...decryptedText]
				.map(char => {
					const charIndex = CHARSET.indexOf(char);
					if (charIndex === -1) return char;
					const offset = randomNumberGenerator(95);
					return CHARSET[(charIndex - offset + 95) % 95];
				})
				.join('');
			decryptedText = columnarCipher(decryptedText, encryptionPassphrase);
			const shuffledCharset = deterministicUnshuffle(CHARSET, encryptionPassphrase);
			const mappingArr = {};
			shuffledCharset.forEach((c, i) => (mappingArr[c] = CHARSET[i]));
			decryptedText = [...decryptedText].map(char => mappingArr[char] || char).join('');
		}
		const lengthString = decryptedText.slice(0, 4);
		let length = parseInt(lengthString, 10);
		if (isNaN(length) || length <= 0 || length > decryptedText.length - 4) {
			console.error('Invalid length in decrypted string');
			return decryptedText;
		}
		const decryptedString = decryptedText.slice(4, 4 + length);
		try {
			return JSON.parse(decryptedString);
		} catch (e) {
			console.warn('Could not parse decrypted string, unlikely to be valid. Using regex to verify');
			const regex = /"file":"(.*?)".*?"type":"(.*?)"/;
			const match = encryptedText.match(regex);
			const matchedFile = match?.[1];
			const matchType = match?.[2];
			if (!matchedFile || !matchType) {
				console.error('Could not match file or type in decrypted string');
				return null;
			}
			return decryptedString;
		}
	}
	/**
   * Tries to extract the MegaCloud nonce from the given embed URL.
   * 
   * Fetches the HTML of the page, and tries to extract the nonce from it.
   * If that fails, it sends a request with the "x-requested-with" header set to "XMLHttpRequest"
   * and tries to extract the nonce from that HTML.
   * 
   * If all else fails, it logs the HTML of both requests and returns null.
   * 
   * @param {string} embedUrl The URL of the MegaCloud embed
   * @returns {string|null} The extracted nonce, or null if it couldn't be found
   */
	async function getNonce(embedUrl) {
		const res = await soraFetch(embedUrl, { headers: { "referer": "https://anicrush.to/", "x-requested-with": "XMLHttpRequest" } });
		const html = await res.text();
		const match0 = html.match(/\<meta[\s\S]*?name="_gg_fb"[\s\S]*?content="([\s\S]*?)">/);
		if (match0?.[1]) {
			return match0[1];
		}
		const match1 = html.match(/_is_th:(\S*?)\s/);
		if (match1?.[1]) {
			return match1[1];
		}
		const match2 = html.match(/data-dpi="([\s\S]*?)"/);
		if (match2?.[1]) {
			return match2[1];
		}
		const match3 = html.match(/_lk_db[\s]?=[\s\S]*?x:[\s]"([\S]*?)"[\s\S]*?y:[\s]"([\S]*?)"[\s\S]*?z:[\s]"([\S]*?)"/);
		if (match3?.[1] && match3?.[2] && match3?.[3]) {
			return "" + match3[1] + match3[2] + match3[3];
		}
		const match4 = html.match(/nonce="([\s\S]*?)"/);
		if (match4?.[1]) {
			if (match4[1].length >= 32) return match4[1];
		}
		const match5 = html.match(/_xy_ws = "(\S*?)"/);
		if (match5?.[1]) {
			return match5[1];
		}
		const match6 = html.match(/[a-zA-Z0-9]{48}]/);
		if (match6?.[1]) {
			return match6[1];
		}
		return null;
	}
	async function getDecryptedSourceV3(encrypted, nonce) {
		let decrypted = null;
		const keys = await asyncGetKeys();
		for(let key in keys) {
			try {
				if (!encrypted) {
					console.log("Encrypted source missing in response")
					return null;
				}
				decrypted = decrypt(keys[key], nonce, encrypted);
				if(!Array.isArray(decrypted) || decrypted.length <= 0) {
					// Failed to decrypt source
					continue;
				}
				for(let source of decrypted) {
					if(source != null && source?.file?.startsWith('https://')) {
						// Malformed decrypted source
						continue;
					}
				}
				console.log("Functioning key:", key);
				return decrypted;
			} catch(error) {
				console.error('Error:', error);
				console.error(`[${ new Date().toLocaleString() }] Key did not work: ${ key }`);
				continue;
			}
		}
		return null;
	}
	async function asyncGetKeys() {
		const resolution = await Promise.allSettled([
			fetchKey("ofchaos", "https://ac-api.ofchaos.com/api/key"),
			fetchKey("yogesh", "https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json"),
			fetchKey("esteven", "https://raw.githubusercontent.com/carlosesteven/e1-player-deobf/refs/heads/main/output/key.json")
		]);
		const keys = resolution.filter(r => r.status === 'fulfilled' && r.value != null).reduce((obj, r) => {
			let rKey = Object.keys(r.value)[0];
			let rValue = Object.values(r.value)[0];
			if (typeof rValue === 'string') {
				obj[rKey] = rValue.trim();
				return obj;
			}
			obj[rKey] = rValue?.mega ?? rValue?.decryptKey ?? rValue?.MegaCloud?.Anime?.Key ?? rValue?.megacloud?.key ?? rValue?.key ?? rValue?.megacloud?.anime?.key ?? rValue?.megacloud;
			return obj;
		}, {});
		if (keys.length === 0) {
			throw new Error("Failed to fetch any decryption key");
		}
		return keys;
	}
	function fetchKey(name, url) {
		return new Promise(async (resolve) => {
			try {
				const response = await soraFetch(url, { method: 'get' });
				const key = await response.text();
				let trueKey = null;
				try {
					trueKey = JSON.parse(key);
				} catch (e) {
					trueKey = key;
				}
				resolve({ [name]: trueKey })
			} catch (error) {
				resolve(null);
			}
		});
	}
}


/* --- mp4upload --- */

/**
 * @name mp4uploadExtractor
 * @author Cufiy
 */
async function mp4uploadExtractor(html, url = null) {
    const regex = /src:\s*"([^"]+)"/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    console.log("No match found for mp4upload extractor");
    return null;
  }
}


/* --- oneupload --- */

/**
 * @name oneuploadExtractor
 * @author 50/50
 */
async function oneuploadExtractor(data, url = null) {
    const match = data.match(/sources:\s*\[\{file:"([^"]+)"\}\]/);
    const fileUrl = match ? match[1] : null;
    return fileUrl;
}


/* --- packer --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name packerExtractor
 * @author 50/50
 */
async function packerExtractor(data, url = null) {
    const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    const unpackedScript = unpack(obfuscatedScript[1]);
    const m3u8Match = unpackedScript.match(/"hls2"\s*:\s*"([^"]+)"/);
    const m3u8Url = m3u8Match[1];
    return m3u8Url;
}



/* --- playerwish --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name playwishExtractor
 * @author 50/50
 */
async function playwishExtractor(data, url = null) {
    const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    const unpackedScript = unpack(obfuscatedScript[1]);
    const m3u8Match = unpackedScript.match(/"hls2"\s*:\s*"([^"]+)"/);
    const m3u8Url = m3u8Match[1];
    return m3u8Url;
}



/* --- savefiles --- */

/**
 * @name savefilesExtractor
 * @author Cufiy
 */
async function savefilesExtractor(data, url = null) {
    const match = data.match(/sources:\s*\[\{file:"([^"]+)"\}\]/);
    const fileUrl = match ? match[1] : null;
    return fileUrl;
}


/* --- sendvid --- */

/**
 * @name sendvidExtractor
 * @author 50/50
 */
async function sendvidExtractor(data, url = null) {
    const match = data.match(/var\s+video_source\s*=\s*"([^"]+)"/);
    const videoUrl = match ? match[1] : null;
    return videoUrl;
}


/* --- sibnet --- */

/**
 * @name sibnetExtractor
 * @author scigward
 */
async function sibnetExtractor(html, embedUrl) {
    try {
        const videoMatch = html.match(
            /player\.src\s*\(\s*\[\s*\{\s*src\s*:\s*["']([^"']+)["']/i
        );
        if (!videoMatch || !videoMatch[1]) {
            throw new Error("Sibnet video source not found");
        }
        const videoPath = videoMatch[1];
        const videoUrl = videoPath.startsWith("http")
            ? videoPath
            : `https://video.sibnet.ru${videoPath}`;
        return videoUrl;
    } catch (error) {
        console.log("SibNet extractor error: " + error.message);
        return null;
    }
}


/* --- smoothpre --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name SmoothPre Extractor
 * @author 50/50
 */
async function smoothpreExtractor(data, url = null) {
    console.log("Using SmoothPre Extractor");
    console.log("Data Length: " + data.length);
    const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    if (!obfuscatedScript || !obfuscatedScript[1]) {
        console.log("No obfuscated script found");
        return null;
    }
    const unpackedScript = unpack(obfuscatedScript[1]);

    const hls2Match = unpackedScript.match(/"hls2"\s*:\s*"([^"]+)"/);
    const hls2Url = hls2Match ? hls2Match[1] : null;
    return hls2Url;
}




/* --- streamhg --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name streamhgExtractor
 * @author cufiy
 */
async function streamhgExtractor(data, url = null) {
    const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    const decodedScript = unpack(obfuscatedScript[1]);
    const hlsStreamUrlMatch = decodedScript.match(/"hls2"\s*:\s*"([^"]+)"/);
    return hlsStreamUrlMatch[1];
}



/* --- streamtape --- */

/**
 * 
 * @name streamTapeExtractor
 * @author ShadeOfChaos
 */
async function streamtapeExtractor(html, url) {
    let promises = [];
    const LINK_REGEX = /link['"]{1}\).innerHTML *= *['"]{1}([\s\S]*?)["'][\s\S]*?\(["']([\s\S]*?)["']([\s\S]*?);/g;
    const CHANGES_REGEX = /([0-9]+)/g;
    if(html == null) {
        if(url == null) {
            throw new Error('Provided incorrect parameters.');
        }
        const response = await soraFetch(url);
        html = await response.text();
    }
    const matches = html.matchAll(LINK_REGEX);
    for (const match of matches) {
        let base = match?.[1];
        let params = match?.[2];
        const changeStr = match?.[3];
        if(changeStr == null || changeStr == '') continue;
        const changes = changeStr.match(CHANGES_REGEX);
        for(let n of changes) {
            params = params.substring(n);
        }
        while(base[0] == '/') {
            base = base.substring(1);
        }
        const url = 'https://' + base + params;
        promises.push(testUrl(url));
    }
    // Race for first success
    return Promise.any(promises).then((value) => {
        return value;
    }).catch((error) => {
        return null;
    });
    async function testUrl(url) {
        return new Promise(async (resolve, reject) => {
            try {
                // Timeout version prefered, but Sora does not support it currently
                // var response = await soraFetch(url, { method: 'GET', signal: AbortSignal.timeout(2000) });
                var response = await soraFetch(url);
                if(response == null) throw new Error('Connection timed out.');
            } catch(e) {
                console.error('Rejected due to:', e.message);
                return reject(null);
            }
            if(response?.ok && response?.status === 200) {
                return resolve(url);
            }
            console.warn('Reject because of response:', response?.ok, response?.status);
            return reject(null);
        });
    }
}


/* --- streamup --- */

/**
 * @name StreamUp Extractor
 * @author Cufiy
 */
async function streamupExtractor(data, url = null) {
    // if url ends with /, remove it
    if (url.endsWith("/")) {
        url = url.slice(0, -1);
    }
    // split the url by / and get the last part
    const urlParts = url.split("/");
    const videoId = urlParts[urlParts.length - 1];
    const apiUrl = `https://strmup.to/ajax/stream?filecode=${videoId}`;
    const response = await soraFetch(apiUrl);
    const jsonData = await response.json();
    if (jsonData && jsonData.streaming_url) {
        return jsonData.streaming_url;
    } else {
        console.log("No streaming URL found in the response.");
        return null;
    }
}


/* --- streamwish --- */

/**
 * @name streamwishExtractor
 * @author Ibro
 */
async function streamwishExtractor(data, url = null) {
    const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
    const unpackedScript = unpack(obfuscatedScript[1]);
    const m3u8Match = unpackedScript.match(/file:"(https?:\/\/.*?\.m3u8.*?)"/);
    const m3u8Url = m3u8Match[1];
    console.log(m3u8Url);
    return m3u8Url;
}
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////       Helper Functions       ////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
/*
Credit to GitHub user @mnsrulz for Unpacker Node library
Credits to @jcpiccodev for writing the full deobfuscator <3
*/



/* --- supervideo --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name SuperVideo Extractor
 * @author 50/50
 */
async function supervideoExtractor(data, url = null) {
        const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
        const unpackedScript = unpack(obfuscatedScript[1]);
        const regex = /file:\s*"([^"]+\.m3u8)"/;
        const match = regex.exec(unpackedScript);
        if (match) {
            const fileUrl = match[1];
            console.log("File URL:" + fileUrl);
            return fileUrl;
        }
        return "No stream found";
}



/* --- uploadcx --- */

/**
 * @name UploadCx Extractor
 * @author 50/50
 */
async function uploadcxExtractor(data, url = null) {
    const mp4Match = /sources:\s*\["([^"]+\.mp4)"]/i.exec(data);
    return mp4Match ? mp4Match[1] : null;
}


/* --- uqload --- */

/**
 * @name uqloadExtractor
 * @author scigward
 */
async function uqloadExtractor(html, embedUrl) {
    try {
        const match = html.match(/sources:\s*\[\s*"([^"]+\.mp4)"\s*\]/);
        const videoSrc = match ? match[1] : "";
        return videoSrc;
    } catch (error) {
        console.log("uqloadExtractor error:", error.message);
        return null;
    }
}


/* --- videospk --- */

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name videospkExtractor
 * @author 50/50
 */
async function videospkExtractor(data, url = null) {
        const obfuscatedScript = data.match(/<script[^>]*>\s*(eval\(function\(p,a,c,k,e,d.*?\)[\s\S]*?)<\/script>/);
        const unpackedScript = unpack(obfuscatedScript[1]);
        const streamMatch = unpackedScript.match(/["'](\/stream\/[^"']+)["']/);
        const hlsLink = streamMatch ? streamMatch[1] : null;
        return "https://videospk.xyz" + hlsLink;
}



/* --- vidmoly --- */

/**
 * @name vidmolyExtractor
 * @author Ibro
 */
async function vidmolyExtractor(html, url = null) {
  const regexSub = /<option value="([^"]+)"[^>]*>\s*SUB - Omega\s*<\/option>/;
  const regexFallback = /<option value="([^"]+)"[^>]*>\s*Omega\s*<\/option>/;
  const fallback =
    /<option value="([^"]+)"[^>]*>\s*SUB v2 - Omega\s*<\/option>/;
  let match =
    html.match(regexSub) || html.match(regexFallback) || html.match(fallback);
  if (match) {
    const decodedHtml = atob(match[1]); // Decode base64
    const iframeMatch = decodedHtml.match(/<iframe\s+src="([^"]+)"/);
    if (!iframeMatch) {
      console.log("Vidmoly extractor: No iframe match found");
      return null;
    }
    const streamUrl = iframeMatch[1].startsWith("//")
      ? "https:" + iframeMatch[1]
      : iframeMatch[1];
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
    html = await response.text();
  } 
    console.log("Vidmoly extractor: No match found, using fallback");
    //  regex the sources: [{file:"this_is_the_link"}]
    const sourcesRegex = /sources:\s*\[\s*\{\s*file:\s*['"](https?:\/\/[^'"]+)['"]\s*\}/;
    const sourcesMatch = html.match(sourcesRegex);
    let sourcesString = sourcesMatch
      ? sourcesMatch[1].replace(/'/g, '"')
      : null;
    return sourcesString;
  
}


/* --- vidoza --- */

/**
 * @name vidozaExtractor
 * @author Cufiy
 */
async function vidozaExtractor(html, url = null) {
  const regex = /<source src="([^"]+)" type='video\/mp4'>/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    console.log("No match found for vidoza extractor");
    return null;
  }
}


/* --- vk --- */

/**
 * @name vkExtractor
 * @author scigward
 */
async function vkExtractor(html, embedUrl) {
    try {
        const hlsMatch = html.match(/"hls"\s*:\s*"([^"]+)"/);
        if (!hlsMatch || !hlsMatch[1]) {
            throw new Error("HLS stream not found in VK embed");
        }
        const videoSrc = hlsMatch[1].replace(/\\\//g, "/");
        return videoSrc;
    } catch (error) {
        console.log("vkExtractor error:", error.message);
        return null;
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


/***********************************************************
 * UNPACKER MODULE
 * Credit to GitHub user "mnsrulz" for Unpacker Node library
 * https://github.com/mnsrulz/unpacker
 ***********************************************************/
class Unbaser {
    constructor(base) {
        this.ALPHABET = {
            62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            95: "' !\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'",
        };
        this.dictionary = {};
        this.base = base;
        if (36 < base && base < 62) {
            this.ALPHABET[base] = this.ALPHABET[base] ||
                this.ALPHABET[62].substr(0, base);
        }
        if (2 <= base && base <= 36) {
            this.unbase = (value) => parseInt(value, base);
        }
        else {
            try {
                [...this.ALPHABET[base]].forEach((cipher, index) => {
                    this.dictionary[cipher] = index;
                });
            }
            catch (er) {
                throw Error("Unsupported base encoding.");
            }
            this.unbase = this._dictunbaser;
        }
    }
    _dictunbaser(value) {
        let ret = 0;
        [...value].reverse().forEach((cipher, index) => {
            ret = ret + ((Math.pow(this.base, index)) * this.dictionary[cipher]);
        });
        return ret;
    }
}

function detectUnbaser(source) {
    /* Detects whether `source` is P.A.C.K.E.R. coded. */
    return source.replace(" ", "").startsWith("eval(function(p,a,c,k,e,");
}

function unpack(source) {
    let { payload, symtab, radix, count } = _filterargs(source);
    if (count != symtab.length) {
        throw Error("Malformed p.a.c.k.e.r. symtab.");
    }
    let unbase;
    try {
        unbase = new Unbaser(radix);
    }
    catch (e) {
        throw Error("Unknown p.a.c.k.e.r. encoding.");
    }
    function lookup(match) {
        const word = match;
        let word2;
        if (radix == 1) {
            word2 = symtab[parseInt(word)];
        }
        else {
            word2 = symtab[unbase.unbase(word)];
        }
        return word2 || word;
    }
    source = payload.replace(/\b\w+\b/g, lookup);
    return _replacestrings(source);
    function _filterargs(source) {
        const juicers = [
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\), *(\d+), *(.*)\)\)/,
            /}\('(.*)', *(\d+|\[\]), *(\d+), *'(.*)'\.split\('\|'\)/,
        ];
        for (const juicer of juicers) {
            const args = juicer.exec(source);
            if (args) {
                let a = args;
                if (a[2] == "[]") {
                }
                try {
                    return {
                        payload: a[1],
                        symtab: a[4].split("|"),
                        radix: parseInt(a[2]),
                        count: parseInt(a[3]),
                    };
                }
                catch (ValueError) {
                    throw Error("Corrupted p.a.c.k.e.r. data.");
                }
            }
        }
        throw Error("Could not make sense of p.a.c.k.e.r data (unexpected code structure)");
    }
    function _replacestrings(source) {
        return source;
    }
}



/* {GE END} */
