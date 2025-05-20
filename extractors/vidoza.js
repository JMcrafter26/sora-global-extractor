async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await vidozaExtractor(html);
    } catch (error) {
      console.log("vidoza HD extraction error:" + error);
    }

    console.log("vidoza Stream URL: " + streamUrl);
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
 * @name vidozaExtractor
 * @author Ibro
 */

async function vidozaExtractor(html, url = null) {
  // get <source src="https://str30.vidoza.net/nvl4ja2elqfeieno3xzqjef6pavssbnspaj6vfb32snkpucojgrclpgnrtkq/v.mp4" type='video/mp4'>
  const regex = /<source src="([^"]+)" type='video\/mp4'>/;
  const match = html.match(regex);
  if (match) {
    return match[1];
  }
}

/* SCHEME END */