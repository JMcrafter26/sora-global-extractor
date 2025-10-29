

async function extractStreamUrl(url) {
  try {
    let streamUrl = null;
    try {
      streamUrl = await dailymotionExtractor(null, url);
    } catch (error) {
      console.log("dailymotion extraction error:" + error);
    }

    console.log("dailymotion Stream URL: " + streamUrl);
    if (streamUrl && streamUrl !== false && streamUrl !== null) {
      return streamUrl;
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


