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
      if (streamUrl) {
        return streamUrl;
      }
    } catch (error) {
      // Ignore the error and try the next provider
    }
  }
  return null;
}


async function extractStreamUrlByProvider(url, provider) {
  // fetch the url
  // and pass the response to the extractor function
  console.log("Fetching URL: " + url);
  const response = await fetch(url);
  console.log("Response: " + response.status);
  const html = response.text ? await response.text() : response;
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
  console.log("Global extractor test");
  const providers = {
    "https://speedfiles.net/40d98c5ccf9c": "speedfiles",
    "https://vidmoly.to/embed-preghvoyp42m.html": "vidmoly",
    "https://turbovid.eu/embed/ZhkbFoEBXfJu": "turbovid",
    "https://bigwarp.io/2403850bcotp": "bigwarp",
  };

  let streamUrls = [];
  let i = 0;
  // seperate test for each provider
  for (const [url, provider] of Object.entries(providers)) {
    i++;
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

  console.log("\n\nTest results:");
  streamUrls.forEach((item) => {
    console.log(`${item.provider}: ${item.streamUrl}`);
  });


  // check if all streamUrls are valid and so the tests are successful
  const allValid = streamUrls.every((item) => item.streamUrl !== null);
  if (allValid) {
    // all tests passed in bold and green
    console.log("\x1b[32m\x1b[1mAll tests passed\x1b[0m");
  } else {
    console.log("\x1b[31m\x1b[1mSome tests failed\x1b[0m");
    streamUrls.forEach((item) => {
      if (item.streamUrl === null) {
        console.log(`Failed for ${item.provider}: ${item.url}`);
      }
    });
  }

}
test();

/* TEST SCHEME END */

////////////////////////////////////////////////
//                 EXTRACTORS                 //
////////////////////////////////////////////////

/* {EXTRACTOR_FUNCTIONS} */