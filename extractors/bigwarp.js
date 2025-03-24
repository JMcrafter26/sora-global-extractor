async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await bigWarpExtract(html);
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

async function bigWarpExtract(html) {
  console.log("BigWarp HD extraction method");
  const bwRegex =
    /<ul class="currentStreamLinks"[\s\S]*?<p class="hostName">BigWarp HD<\/p>[\s\S]*?<a[^>]+class="button rb iconPlay"[^>]+href="([^"]+)"[^>]*>/;
  const bwMatch = bwRegex.exec(html);

  if (!bwMatch || !bwMatch[1]) {
    console.log("BigWarp HD stream URL not found");
    return false;
  }

  let bwUrl = bwMatch[1];

  console.log("BigWarp URL:", bwUrl);

  const videoPage = await fetch(bwUrl);

  const scriptRegex =
    /jwplayer\("vplayer"\)\.setup\(\{[\s\S]*?sources:\s*\[\{file:"([^"]+)",label:"[^"]+"\}\]/;
  const scriptMatch = scriptRegex.exec(videoPage);
  const bwDecoded = scriptMatch ? scriptMatch[1] : false;
  console.log("BigWarp HD Decoded:", bwDecoded);
  return bwDecoded;
}
