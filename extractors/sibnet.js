async function extractStreamUrl(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'encoding': 'windows-1251'
            }
        });
        // encoding: 'windows-1251' header
        const html = (await response.text) ? await response.text() : response;

        let streamUrl = null;
        try {
            streamUrl = await sibnetExtractor(html, url);
        } catch (error) {
            console.log("SibNet extraction error: " + error);
        }

        console.log("SibNet Stream URL: " + (streamUrl?.url || "Not found"));
        if (streamUrl && streamUrl.url) {
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
 * @name sibnetExtractor
 * @author scigward
 */

async function sibnetExtractor(html, embedUrl) {
    try {
        const videoMatch = html.match(
            /player\.src\s*\(\s*\[\s*\{\s*src\s*:\s*["']([^"']+)["']/i
        );

        if (!videoMatch || !videoMatch[1]) {
            throw new Error("Sibnet video source not found");
        }

        const videoPath = videoMatch[1];
        const videoUrl = videoPath.startsWith("http")
            ? videoPath
            : `https://video.sibnet.ru${videoPath}`;

        return videoUrl;
    } catch (error) {
        console.log("SibNet extractor error: " + error.message);
        return null;
    }
}

/* SCHEME END */