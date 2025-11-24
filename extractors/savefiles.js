async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await soraFetch(url);
        console.log("Response status:", response.status);
        const data = await response.text();
        try {
            streamUrl = await savefilesExtractor(data, url);
        } catch (error) {
            console.log("SaveFiles extraction error:" + error);
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
 * @name savefilesExtractor
 * @author Cufiy
 */
async function savefilesExtractor(data, url = null) {
    const match = data.match(/sources:\s*\[\{file:"([^"]+)"\}\]/);
    const fileUrl = match ? match[1] : null;

    return fileUrl;

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
