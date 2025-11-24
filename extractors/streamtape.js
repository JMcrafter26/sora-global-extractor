async function extractStreamUrl(url) {
  try {
    let streamUrl = null;
      let headers = {
   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0",
   "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  };
    const response = await soraFetch(url, {
        headers
    });
    const data = await response.text();
    try {
      streamUrl = await streamtapeExtractor(data, url);
    } catch (error) {
      console.log("StreamTape extraction error:" + error);
    }
    if (streamUrl) {
      return streamUrl;
    }
    return null;
  } catch (error) {
    console.log("Fetch error:", error);
    return null;
  }
}

/* SCHEME START */

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

/* SCHEME END */

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
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}
/* REMOVE_END */

try {
    const streamUrl = await extractStreamUrl("https://tapepops.com/e/GMRoe9vmGJH1v7G");
    console.log("Extracted Stream URL:", streamUrl);
} catch (error) {
    console.error("Error during extraction:", error);
}