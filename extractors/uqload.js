async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = (await response.text) ? await response.text() : response;

        let stream = null;
        try {
            stream = await uqloadExtractor(html, url);
        } catch (error) {
            console.log("Uqload extraction error: " + error);
        }

        if (stream?.url) {
            console.log("Uqload Stream URL:", stream.url);
            return stream.url;
        }

        console.log("No Uqload stream URL found");
        return null;
    } catch (error) {
        console.log("Fetch error:", error);
        return null;
    }
}

/* SCHEME START */

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

/* SCHEME END */
