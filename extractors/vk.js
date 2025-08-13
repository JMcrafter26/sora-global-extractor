async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = (await response.text) ? await response.text() : response;

        let stream = null;
        try {
            stream = await vkExtractor(html, url);
        } catch (error) {
            console.log("VK extraction error: " + error);
        }

        if (stream?.url) {
            console.log("VK Stream URL:", stream.url);
            return stream.url;
        }

        console.log("No VK stream URL found");
        return null;
    } catch (error) {
        console.log("Fetch error:", error);
        return null;
    }
}

/* SCHEME START */

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

/* SCHEME END */