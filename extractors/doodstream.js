
async function extractStreamUrl(url) {
    try {
        const response = await fetch(url);
        const html = (await response.text) ? response.text() : response;

        let streamUrl = null;
        try {
            streamUrl = await doodstreamExtractor(html);
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
        const streamDomain = url.match(/https:\/\/(.*?)\//, url)[0].slice(8, -1);
        const md5Path = html.match(/'\/pass_md5\/(.*?)',/, url)[0].slice(11, -2);

        const token = md5Path.substring(md5Path.lastIndexOf("/") + 1);
        const expiryTimestamp = new Date().valueOf();
        const random = randomStr(10);

        const passResponse = await fetch(`https://${streamDomain}/pass_md5/${md5Path}`, {
            headers: {
                "Referer": url,
            },
        });
        console.log("DoodStream extractor response: " + passResponse.status);
        const responseData = await passResponse.text();
        const videoUrl = `${responseData}${random}?token=${token}&expiry=${expiryTimestamp}`;
        console.log("DoodStream extractor video URL: " + videoUrl);
        return videoUrl;
}

function randomStr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/* SCHEME END */