async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await voeExtract(html);
    } catch (error) {
      console.log("VOE HD extraction error:", error);
    }

    console.log("Voe Stream URL: " + streamUrl);
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

async function voeExtract(html) {
  console.log("VOE HD extraction method");
  const voeRegex =
    /<ul class="currentStreamLinks"[\s\S]*?<p class="hostName">VOE HD<\/p>[\s\S]*?<a[^>]+class="button rb iconPlay"[^>]+href="([^"]+)"[^>]*>/;
  const voeMatch = voeRegex.exec(html);

  if (!voeMatch || !voeMatch[1]) {
    console.log("VOE HD stream URL not found");
    return false;
  }
  const voeUrl = voeMatch[1];

  console.log("VOE URL:", voeUrl);

  const videoPage = await fetch(voeUrl);
  if (!videoPage) {
    console.log("VOE HD video page not found");
    return false;
  }

  const scriptRegex = /window\.location\.href\s*=\s*['"]([^'"]+)['"]/;
  const scriptMatch = scriptRegex.exec(videoPage);
  const winLocUrl = scriptMatch ? scriptMatch[1] : "";

  if (!winLocUrl) {
    console.log("VOE HD window location URL not found");
    return false;
  }

  const hlsSourceUrl = await fetch(winLocUrl);

  const sourcesRegex = /var\s+sources\s*=\s*({[^}]+})/;
  const sourcesMatch = sourcesRegex.exec(hlsSourceUrl);
  let sourcesString = sourcesMatch ? sourcesMatch[1].replace(/'/g, '"') : null;

  sourcesString = sourcesString
    ? sourcesString.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
    : null;

  const sources = sourcesString ? JSON.parse(sourcesString) : null;
  if (sources && sources.hls) {
    const hlsBase64 = sources.hls;
    const hlsDecoded = base64Decode(hlsBase64);
    console.log("HLS Decoded:" + hlsDecoded);
    return hlsDecoded;
  }

  return false;
}

function base64Decode(str) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";

  str = String(str).replace(/=+$/, "");

  if (str.length % 4 === 1) {
    throw new Error(
      "'atob' failed: The string to be decoded is not correctly encoded."
    );
  }

  for (
    let bc = 0, bs, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}
