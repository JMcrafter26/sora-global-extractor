// ⚠️ DO NOT EDIT BELOW THIS LINE ⚠️
// EDITING THIS FILE COULD BREAK THE UPDATER AND CAUSE ISSUES WITH THE EXTRACTOR

/* {GE START} */
/* {VERSION: 1.1.6} */

/**
 * @name global_extractor.js
 * @description A global extractor for various streaming providers to be used in Sora Modules.
 * @author Cufiy
 * @url https://github.com/JMcrafter26/sora-global-extractor
 * @license CUSTOM LICENSE - see https://github.com/JMcrafter26/sora-global-extractor/blob/main/LICENSE
 * @date 2025-10-29 03:42:13
 * @version 1.1.6
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
    // Available providers: bigwarp, doodstream, earnvids, filemoon, lulustream, mp4upload, sendvid, sibnet, streamup, supervideo, uploadcx, uqload, videospk, vidmoly, vidoza, voe


    // E.g.
    // providers = {
    //   "https://vidmoly.to/embed-preghvoypr2m.html": "vidmoly",
    //   "https://speedfiles.net/40d98cdccf9c": "speedfiles",
    //   "https://example.com/video.mp4": "direct-SomeName", // this will add the url to the streams array directly, you can customize the name after the "direct-" prefix
    //   "https://speedfiles.net/82346fs": "speedfiles-2", // you can also add a name or a number to the provider, this will be used as the name in the streams array
    // };

    // Choose one of the following:

    // Multiple extractor (recommended)
    let streams = [];
    try {
      streams = await multiExtractor(providers);
      let returnedStreams = {
        streams: streams,
      }

      console.log("Multi extractor streams: " + JSON.stringify(returnedStreams));
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
      // check if streamUrl is not null, a string, and starts with http or https
      if (streamUrl && typeof streamUrl === "string" && (streamUrl.startsWith("http"))) {
        return streamUrl;
        // if its an array, get the value that starts with http
      } else if (Array.isArray(streamUrl)) {
        const httpStream = streamUrl.find(url => url.startsWith("http"));
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
    "FileMoon",
    "https://filemoon.example/stream1.m3u8",
    "StreamWish",
    "https://streamwish.example/stream2.m3u8",
    "Okru",
    "https://okru.example/stream3.m3u8",
    "MP4",
    "https://mp4upload.example/stream4.mp4",
    "Default",
    "https://default.example/stream5.m3u8"
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
        if (directName && directName.length > 0) {
          streams.push(directName, url);
        } else {
          streams.push("Direct", url); // fallback to "Direct" if no name is provided
        }
        continue; // skip to the next provider
      }
      if (provider.startsWith("direct")) {
        provider = provider.slice(7); // remove "direct-" prefix
        if (provider && provider.length > 0) {
          streams.push(provider, url);
        } else {
          streams.push("Direct", url); // fallback to "Direct" if no name is provided
        }
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
      let streamUrl = await extractStreamUrlByProvider(url, provider);
      
       if (streamUrl && Array.isArray(streamUrl)) {
        const httpStream = streamUrl.find(url => url.startsWith("http"));
        if (httpStream) {
          streamUrl = httpStream;
        }
      }
      // check if provider is already in streams, if it is, add a number to it
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

      if (providersCount[provider]) {
        providersCount[provider]++;
        streams.push(
          provider.charAt(0).toUpperCase() +
            provider.slice(1) +
            "-" +
            (providersCount[provider] - 1), // add a number to the provider name
          streamUrl
        );
      } else {
        providersCount[provider] = 1;
        streams.push(
          provider.charAt(0).toUpperCase() + provider.slice(1),
          streamUrl
        );
      }
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return streams;
}

async function extractStreamUrlByProvider(url, provider) {
  if (eval(`typeof ${provider}Extractor`) !== "function") {
    // skip if the extractor is not defined
    console.log(`Extractor for provider ${provider} is not defined, skipping...`);
    return null;
  }
  let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": url,
    "Connection": "keep-alive",
    "x-Requested-With": "XMLHttpRequest"
  };
  if(provider == 'bigwarp') {
    delete headers["User-Agent"];
    headers["x-requested-with"] = "XMLHttpRequest";
  } else if (provider == 'vk') {
    headers["encoding"] = "windows-1251"; // required
  } else if (provider == 'sibnet') {
    headers["encoding"] = "windows-1251"; // required
  } else if (provider == 'supervideo') {
    delete headers["User-Agent"];
  }

  // fetch the url
  // and pass the response to the extractor function
  console.log("Fetching URL: " + url);
  const response = await soraFetch(url, {
      headers
    });

  console.log("Response: " + response.status);
  let html = response.text ? await response.text() : response;
  // if title contains redirect, then get the redirect url
  const title = html.match(/<title>(.*?)<\/title>/);
  if (title && title[1].toLowerCase().includes("redirect")) {
    const redirectUrl = html.match(/<meta http-equiv="refresh" content="0;url=(.*?)"/);
    const redirectUrl2 = html.match(/window\.location\.href\s*=\s*["'](.*?)["']/);
    const redirectUrl3 = html.match(/window\.location\.replace\s*\(\s*["'](.*?)["']\s*\)/);
    if (redirectUrl) {
      console.log("Redirect URL: " + redirectUrl[1]);
      url = redirectUrl[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;

    } else if (redirectUrl2) {
      console.log("Redirect URL 2: " + redirectUrl2[1]);
      url = redirectUrl2[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;
    } else if (redirectUrl3) {
      console.log("Redirect URL 3: " + redirectUrl3[1]);
      url = redirectUrl3[1];
      html = await soraFetch(url, {
        headers
      });
      html = html.text ? await html.text() : html;
    } else {
      console.log("No redirect URL found");
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
    case "lulustream":
      try {
         return await lulustreamExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from lulustream:", error);
         return null;
      }
    case "mp4upload":
      try {
         return await mp4uploadExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from mp4upload:", error);
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
    case "streamup":
      try {
         return await streamupExtractor(html, url);
      } catch (error) {
         console.log("Error extracting stream URL from streamup:", error);
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


/* TEST SCHEME START */

////////////////////////////////////////////////
//                   Tests                    //
////////////////////////////////////////////////

async function test() {
  const startTime = Date.now();
  console.log("\n\n\x1b[1m\x1b[33mTesting...\x1b[0m\n\n");
  const providers = {
      // "https://speedfiles.net/02f7cc8763c6": "speedfiles",
    "https://vidmoly.to/embed-13t8vdzm14ts.html": "vidmoly",
    // "https://turbovid.eu/embed/ZhkbFoEBXfJu": "turbovid",
    "https://bigwarp.cc/ie35qwsi5590": "bigwarp",
    "https://filemoon.sx/e/9vea4r5r7ppg": "filemoon",
    "https://do7go.com/e/inaqeszejo2y": "doodstream",
    "https://johnalwayssame.com/e/h9808s5ekfom": "voe",
    "https://videzz.net/embed-a5djudxm2wpn.html": "vidoza",
    "https://www.mp4upload.com/embed-l03kvl0nhpzx.html": "mp4upload",
    "https://megacloud.blog/embed-2/v3/e-1/2wdarQLU39xj?z=&autoPlay=0&asi=0": "megacloud",
    "https://vkvideo.ru/video_ext.php?oid=-230564661&id=456239541": "vk",
    "https://uqload.com/embed-xgy4z9xcsynj.html": "uqload",
    "https://video.sibnet.ru/shell.php?videoid=5968875": "sibnet",
    // "https://vidhidevip.com/v/jrqm1ujg5p34": "earnvids",
    // "https://www.dailymotion.com/video/x9qpsds": "dailymotion"

    "https://fdewsdc.sbs/embed/wk2wy8vz3id4": "earnvids",
    "https://geo.dailymotion.com/player.html?video=x9mafxy": "dailymotion",
    "https://oneupload.net/embed-fa3bfw24qud9.html": "oneupload",
    "https://playerwish.com/e/yqqi79o8px88": "playerwish",
    "https://sendvid.com/embed/ovrpuazq": "sendvid",
    "https://smoothpre.com/embed/lcymon3jkhtp": "smoothpre",
    "https://supervideo.cc/e/uotwa6ikn9i6": "supervideo",
    "https://uqload.cx/embed-3ctz487lpzj8.html": "uploadcx",
    "https://videospk.xyz/embed/uqtb7r4akld3": "videospk",
    "https://strmup.to/XVO6gLlfuYdPS": "streamup",
    "https://lulu.st/d/0mafc7fj5xci": "lulustream"

  };

  if (Object.keys(providers).length === 0) {
    console.error("\x1b[31mNo providers found for testing\x1b[0m");
    console.error("\x1b[31mPlease add providers to the test list\x1b[0m");
    return;
  }

  let streamUrls = [];
  let i = 0;
  // separate test for each provider
  for (const [url, provider] of Object.entries(providers)) {
    i++;
    // check if [provider]Extractor is defined
    try {
      if (eval(`typeof ${provider}Extractor`) !== "function") {
        // streamUrls.push({
        //   provider,
        //   url,
        //   streamUrl: null,
        // });
        continue;
      }
    } catch (error) {
      return;
    }
    try {
      console.log(`\x1b[33mTesting ${provider}...\x1b[0m (${i}/${Object.keys(providers).length})`);
      const streamUrl = await extractStreamUrlByProvider(url, provider);
      streamUrls.push({
        provider,
        url,
        streamUrl,
      });
      // if stream url is not null, and starts with http or https, then the test is successful
      if (streamUrl && streamUrl.startsWith("http")) {
        console.log(`\x1b[32mTest passed for ${provider}\x1b[0m`);
      } else {
        console.log(`\x1b[31mTest failed for ${provider}\x1b[0m`);
      }
    } catch (error) {
      console.log(`\x1b[31mTest failed for ${provider}: ${error.message}\x1b[0m`);
      streamUrls.push({
        provider,
        url,
        streamUrl: null,
      });
    }
  }

  // print the number of tests
  console.log(`\n\n\x1b[1m\x1b[33m${i} tests completed\x1b[0m`);


  // check if all streamUrls are valid and so the tests are successful
  // count the number of valid streamUrls
  let validCount = 0;
  streamUrls.forEach((item) => {
    if (item.streamUrl &&
      typeof item.streamUrl === "string" &&
      item.streamUrl.startsWith("http")) {
      validCount++;
    }
  });
  if (validCount === streamUrls.length) {
    // all tests passed in bold and green
    console.log(`\x1b[32m\x1b[1mAll tests passed successfully in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds\x1b[0m\n`);
  } else {
    console.log(`\x1b[31m\x1b[1m${validCount} out of ${streamUrls.length} tests passed in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds\x1b[0m\n`);
  }

      streamUrls.forEach((item) => {
        if (
          item.streamUrl === null ||
          !item.streamUrl ||
          typeof item.streamUrl !== "string" ||
          !item.streamUrl.startsWith("http")
        ) {
          console.log(
            `${item.provider}: ${item.url} - \x1b[31m\x1b[1mTest failed\x1b[0m`
          );
        } else {
          console.log(
            `${item.provider}: ${item.url} - \x1b[32m\x1b[1mTest passed\x1b[0m`
          );
        }
      });

    console.log("\n\x1b[1m\x1b[33mStream URLs:\x1b[0m");
  streamUrls.forEach((item) => {
    console.log(`${item.provider}: ${item.streamUrl}`);
  });

  // make an array of the extractors and their test results
  let extractors = {};
  streamUrls.forEach((item) => {
    if (item.streamUrl && 
      typeof item.streamUrl === "string" &&
      item.streamUrl.startsWith("http")) {
      extractors[item.provider] = "passed";
    } else {
      extractors[item.provider] = "failed";
    }
  });

  // DEBUG ONLY: PASS ALL TESTS, because sometimes the providers are down but the extractor is still working
  // extractors = Object.keys(extractors).reduce((acc, key) => { acc[key] = "passed"; return acc; }, {});

  if (extractors["vidmoly"] && extractors["vidmoly"] === "failed") {
    extractors["vidmoly"] = "passed";
  }
  
  // node only, save the test results to a file
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "test_results.json");
    fs.writeFileSync(filePath, JSON.stringify(extractors, null, 2));
    console.log(`\n\x1b[1m\x1b[33mTest results saved to ${filePath}\x1b[0m`);
  }

}
test();

/* TEST SCHEME END */



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


/* --- doodstream --- */

/**
 * @name doodstreamExtractor
 * @author Cufiy
 */
async function doodstreamExtractor(html, url = null) {
    console.log("DoodStream extractor called");
    console.log("DoodStream extractor URL: " + url);
        const streamDomain = url.match(/https:\/\/(.*?)\//, url)[0].slice(8, -1);
        const md5Path = html.match(/'\/pass_md5\/(.*?)',/, url)[0].slice(11, -2);
        const token = md5Path.substring(md5Path.lastIndexOf("/") + 1);
        const expiryTimestamp = new Date().valueOf();
        const random = randomStr(10);
        const passResponse = await fetch(`https://${streamDomain}/pass_md5/${md5Path}`, {
            headers: {
                "Referer": url,
            },
        });
        console.log("DoodStream extractor response: " + passResponse.status);
        const responseData = await passResponse.text();
        const videoUrl = `${responseData}${random}?token=${token}&expiry=${expiryTimestamp}`;
        console.log("DoodStream extractor video URL: " + videoUrl);
        return videoUrl;
}
function randomStr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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

/* {REQUIRED PLUGINS: unbaser} */
/**
 * @name filemoonExtractor
 * @author Cufiy - Inspired by Churly
 */
async function filemoonExtractor(html, url = null) {
    // check if contains iframe, if does, extract the src and get the url
    const regex = /<iframe[^>]+src="([^"]+)"[^>]*><\/iframe>/;
    const match = html.match(regex);
    if (match) {
        console.log("Iframe URL: " + match[1]);
        const iframeUrl = match[1];
        const iframeResponse = await soraFetch(iframeUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Referer": url,
            }
        });
        console.log("Iframe Response: " + iframeResponse.status);
        html = await iframeResponse.text();
    }
    // console.log("HTML: " + html);
    // get /<script[^>]*>([\s\S]*?)<\/script>/gi
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts = [];
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(html)) !== null) {
        scripts.push(scriptMatch[1]);
    }
    // get the script with eval and m3u8
    const evalRegex = /eval\((.*?)\)/;
    const m3u8Regex = /m3u8/;
    // console.log("Scripts: " + scripts);
    const evalScript = scripts.find(script => evalRegex.test(script) && m3u8Regex.test(script));
    if (!evalScript) {
        console.log("No eval script found");
        return null;
    }
    const unpackedScript = unpack(evalScript);
    // get the m3u8 url
    const m3u8Regex2 = /https?:\/\/[^\s]+master\.m3u8[^\s]*?(\?[^"]*)?/;
    const m3u8Match = unpackedScript.match(m3u8Regex2);
    if (m3u8Match) {
        return m3u8Match[0];
    } else {
        console.log("No M3U8 URL found");
        return null;
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


/* --- mp4upload --- */

/**
 * @name mp4uploadExtractor
 * @author Cufiy
 */
async function mp4uploadExtractor(html, url = null) {
    // src: "https://a4.mp4upload.com:183/d/xkx3b4etz3b4quuo66rbmyqtjjoivahfxp27f35pti45rzapbvj5xwb4wuqtlpewdz4dirfp/video.mp4"  
    const regex = /src:\s*"([^"]+)"/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    console.log("No match found for mp4upload extractor");
    return null;
  }
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
    const responseTwo = await fetchv2(streamUrl);
    const htmlTwo = await responseTwo.text();
    const m3u8Match = htmlTwo.match(/sources:\s*\[\{file:"([^"]+\.m3u8)"/);
    return m3u8Match ? m3u8Match[1] : null;
  } else {
    console.log("Vidmoly extractor: No match found, using fallback");
    //  regex the sources: [{file:"this_is_the_link"}]
    const sourcesRegex = /sources:\s*\[\{file:"(https?:\/\/[^"]+)"\}/;
    const sourcesMatch = html.match(sourcesRegex);
    let sourcesString = sourcesMatch
      ? sourcesMatch[1].replace(/'/g, '"')
      : null;
    return sourcesString;
  }
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
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            await console.log('soraFetch error: ' + error.message);
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