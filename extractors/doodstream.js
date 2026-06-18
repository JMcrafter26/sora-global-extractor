
async function extractStreamUrl(url) {
    try {
        let uas = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15",
            "Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36",
        ];
        let headers = {
            "User-Agent": uas[(url.length) % uas.length], // use a different user agent based on the url and provider
            "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": url,
            "Connection": "keep-alive",
            "x-Requested-With": "XMLHttpRequest",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
        };

        const response = await soraFetch(url, { headers });
        const html = await response.text();

        let streamUrl = null;
        try {
            streamUrl = await doodstreamExtractor(html, url);
        } catch (error) {
            console.log("DoodStream extraction error:" + error);
        }

        console.log("DoodStream Stream URL: " + streamUrl);
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
 * @name doodstreamExtractor
 * @author Cufiy
 */

async function doodstreamExtractor(html, url = null) {
    console.log("DoodStream extractor called");
    console.log("DoodStream extractor URL: " + url);

    const match = html.match(/\/pass_md5\/([a-fA-F0-9\-]+)\/([a-zA-Z0-9]+)/);
    if (!match) {
        console.log('Could not find hash/token in the page.');
        return;
    }
    const hash = match[1];
    const token = match[2];
    console.log('🔑 Hash:', hash, 'Token:', token);

    const hostUrl = url.match(/https?:\/\/[^\/]+/)[0];

    // 2. Request the base video URL
    const request = await soraFetch(`${hostUrl}/pass_md5/${hash}/${token}`);
    if (!request) {
        console.error('Failed to fetch the base video URL.');
        return;
    }

    const data = await request.text();


    if (!data) {
        console.error('Failed to fetch the base video URL.');
        return;
    }

    if (data.trim() === 'RELOAD') {
        console.error('Token expired or invalid. Received RELOAD response.');
        return;
    }
    let baseUrl = data.trim();
    // If the server returns a relative path, make it absolute
    if (!baseUrl.startsWith('http')) {
        baseUrl = hostUrl + baseUrl;
    }
    console.log('🎬 Base video URL:', baseUrl);

    // 3. Replicate makePlay() – random 10 chars + token + expiry
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < 10; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const suffix = randomStr + '?token=' + token + '&expiry=' + Date.now();
    const finalUrl = baseUrl + suffix;

    console.log('Final video URL:', finalUrl);
    return finalUrl;

}

/* SCHEME END */

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch (e) {
        try {
            return await fetch(url, options);
        } catch (error) {
            return null;
        }
    }
}


console.log(extractStreamUrl("https://playmogo.com/e/ht5m5lpb09mr"));