async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await soraFetch(url);
        const data = await response.text();
        try {
            streamUrl = await foursharedExtractor(data, url);
        } catch (error) {
            console.log("Extraction error:" + error);
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

/* SCHEME END */

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