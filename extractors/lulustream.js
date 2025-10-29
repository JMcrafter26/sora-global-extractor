async function extractStreamUrl(url) {
    try {
        let streamUrl = null;
        const response = await soraFetch(url);
        const data = await response.text();
        try {
            streamUrl = await luluStreamExtractor(data, url);
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
 * @name LuluStream Extractor
 * @author Cufiy
 */

async function lulustreamExtractor(data, url = null) {

  const scriptRegex = /sources:\s*\[\{file:"([^"]+)"/;
  const scriptMatch = scriptRegex.exec(data);
  const decoded = scriptMatch ? scriptMatch[1] : false;
  return decoded;

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