async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    let streamUrl = null;
    try {
      streamUrl = await mp4uploadExtractor(html);
    } catch (error) {
      console.log("mp4upload HD extraction error:" + error);
    }

    console.log("mp4upload Stream URL: " + streamUrl);
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
 * @name mp4uploadExtractor
 * @author Cufiy
 */

async function mp4uploadExtractor(html, url = null) {
    // src: "https://a4.mp4upload.com:183/d/xkx3b4etz3b4quuo66rbmyqtjjoivahfxp27f35pti45rzapbvj5xwb4wuqtlpewdz4dirfp/video.mp4"  
    const regex = /src:\s*"([^"]+)"/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  } else {
    console.log("No match found for mp4upload extractor");
    return null;
  }
}

/* SCHEME END */