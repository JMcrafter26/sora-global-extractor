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

}
test();

/* TEST SCHEME END */

////////////////////////////////////////////////
//                 EXTRACTORS                 //
////////////////////////////////////////////////

// DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING //

/* {EXTRACTOR_FUNCTIONS} */