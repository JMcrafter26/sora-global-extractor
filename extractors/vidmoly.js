async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await vidmolyExtractor(html);
    } catch (error) {
      console.log("vidmoly HD extraction error:" + error);
    }

    console.log("vidmoly Stream URL: " + streamUrl);
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
 * @name vidmolyExtractor
 * @author Ibro
 */

async function vidmolyExtractor(html) {
  const regexSub = /<option value="([^"]+)"[^>]*>\s*SUB - Omega\s*<\/option>/;
  const regexFallback = /<option value="([^"]+)"[^>]*>\s*Omega\s*<\/option>/;
  const fallback =
    /<option value="([^"]+)"[^>]*>\s*SUB v2 - Omega\s*<\/option>/;

  let match =
    html.match(regexSub) || html.match(regexFallback) || html.match(fallback);
  if (match) {
    const decodedHtml = atob(match[1]); // Decode base64
    const iframeMatch = decodedHtml.match(/<iframe\s+src="([^"]+)"/);

    if (!iframeMatch) {
      console.log("Vidmoly extractor: No iframe match found");
      return null;
    }

    const streamUrl = iframeMatch[1].startsWith("//")
      ? "https:" + iframeMatch[1]
      : iframeMatch[1];

    const responseTwo = await fetchv2(streamUrl);
    const htmlTwo = await responseTwo.text();

    const m3u8Match = htmlTwo.match(/sources:\s*\[\{file:"([^"]+\.m3u8)"/);
    return m3u8Match ? m3u8Match[1] : null;
  } else {
    console.log("Vidmoly extractor: No match found, using fallback");
    //  regex the sources: [{file:"this_is_the_link"}]
    const sourcesRegex = /sources:\s*\[\{file:"(https?:\/\/[^"]+)"\}/;
    const sourcesMatch = html.match(sourcesRegex);
    let sourcesString = sourcesMatch
      ? sourcesMatch[1].replace(/'/g, '"')
      : null;

    return sourcesString;
  }
}

/* SCHEME END */