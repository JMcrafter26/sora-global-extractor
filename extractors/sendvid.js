async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await fetchv2(url);
        const data = await response.text();
        try {
            streamUrl = await sendvidExtractor(data, url);
        } catch (error) {
            console.log("SendVid extraction error:" + error);
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
 * @name sendvidExtractor
 * @author 50/50
 */

async function sendvidExtractor(data, url = null) {
    const match = data.match(/var\s+video_source\s*=\s*"([^"]+)"/);
    const videoUrl = match ? match[1] : null;

    return videoUrl;
}
/* SCHEME END */