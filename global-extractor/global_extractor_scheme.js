/* {HEADER} */

async function extractStreamUrl(url) {
  try {
    let providers = {};

    // Logic to populate providers
    // ...
    // Note: The higher up the provider is in the list, the higher the priority
    // Available providers: /* {ALL_PROVIDERS} */


    // E.g.
    // providers = {
    //   "https://vidmoly.to/embed-preghvoypr2m.html": "vidmoly",
    //   "https://speedfiles.net/40d98cdccf9c": "speedfiles",
    //   "https://speedfiles.net/82346fs": "speedfiles",
    // };

    // Choose one of the following:

    // Multiple extractor (recommended)
    let streams = [];
    try {
      streams = await multiExtractor(newProviderArray);
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

function globalExtractor(providers) {
  for (const [url, provider] of Object.entries(providers)) {
    try {
      const streamUrl = extractStreamUrlByProvider(url, provider);
      // check if streamUrl is not null, a string, and starts with http or https
      if (streamUrl && typeof streamUrl === "string" && (streamUrl.startsWith("http"))) {
        return streamUrl;
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
  for (const [url, provider] of Object.entries(providers)) {
    try {
      // check if providercount is not bigger than 3
      if (providersCount[provider] && providersCount[provider] >= 3) {
        console.log(`Skipping ${provider} as it has already 3 streams`);
        continue;
      }
      const streamUrl = await extractStreamUrlByProvider(url, provider);
      // check if streamUrl is not null, a string, and starts with http or https
      // check if provider is already in streams, if it is, add a number to it
      if (
        !streamUrl ||
        typeof streamUrl !== "string" ||
        !streamUrl.startsWith("http")
      ) {
        continue; // skip if streamUrl is not valid
      }
      if (providersCount[provider]) {
        providersCount[provider]++;
        streams.push(
          provider.charAt(0).toUpperCase() +
            provider.slice(1) +
            "-" +
            providersCount[provider],
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
/* {PROVIDER_CASES} */
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
  /* {TEST_PROVIDERS} */
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
    if (item.streamUrl && item.streamUrl.startsWith("http")) {
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
    if (item.streamUrl && item.streamUrl.startsWith("http")) {
      extractors[item.provider] = "passed";
    } else {
      extractors[item.provider] = "failed";
    }
  });

  // DEBUG ONLY: PASS ALL TESTS
  // extractors = Object.keys(extractors).reduce((acc, key) => { acc[key] = "passed"; return acc; }, {});
  
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

////////////////////////////////////////////////
//                 EXTRACTORS                 //
////////////////////////////////////////////////

// DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING //

/* {EXTRACTOR_FUNCTIONS} */