async function extractStreamUrl(url) {
  try {
    const response = await fetch(url, { headers: { 'Referer': 'https://bigwarp.art/', "x-requested-with": 'XMLHttpRequest' } });
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await bigwarpExtractor(html);
    } catch (error) {
      console.log("BigWarp HD extraction error:", error);
    }

    console.log("BigWarp Stream URL: " + streamUrl);
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
 * 
 * @name bigWarpExtractor
 * @author Cufiy
 */

async function bigwarpExtractor(videoPage, url = null) {


  // regex get 'sources: [{file:"THIS_IS_THE_URL" ... '
  const scriptRegex = /sources:\s*\[\{file:"([^"]+)"/;
  // const scriptRegex =
  const scriptMatch = scriptRegex.exec(videoPage);
  const bwDecoded = scriptMatch ? scriptMatch[1] : false;
  console.log("BigWarp HD Decoded:", bwDecoded);
  return bwDecoded;
}

/* SCHEME END */