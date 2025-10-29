async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await soraFetch(url);
        const data = await response.text();
        try {
            streamUrl = await streamupExtractor(data, url);
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
 * @name StreamUp Extractor
 * @author Cufiy
 */

async function streamupExtractor(data, url = null) {
    // if url ends with /, remove it
    if (url.endsWith("/")) {
        url = url.slice(0, -1);
    }
    // split the url by / and get the last part
    const urlParts = url.split("/");
    const videoId = urlParts[urlParts.length - 1];

    const apiUrl = `https://strmup.to/ajax/stream?filecode=${videoId}`;
    const response = await soraFetch(apiUrl);
    const jsonData = await response.json();
    if (jsonData && jsonData.streaming_url) {
        return jsonData.streaming_url;
    } else {
        console.log("No streaming URL found in the response.");
        return null;
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