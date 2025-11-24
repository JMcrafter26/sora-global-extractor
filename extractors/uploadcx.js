async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await soraFetch(url);
        const data = await response.text();
        try {
            streamUrl = await uploadcxExtractor(data, url);
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
 * @name UploadCx Extractor
 * @author 50/50
 */

async function uploadcxExtractor(data, url = null) {
    const mp4Match = /sources:\s*\["([^"]+\.mp4)"]/i.exec(data);

    return mp4Match ? mp4Match[1] : null;
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