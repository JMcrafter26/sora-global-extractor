async function extractStreamUrl(url) {
  try {
    const response = await fetch(url);
    const html = (await response.text) ? response.text() : response;

    let streamUrl = null;
    try {
      streamUrl = await speedfilesExtractor(html);
    } catch (error) {
      console.log("speedfiles HD extraction error:" + error);
    }

    console.log("speedfiles Stream URL: " + streamUrl);
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
 * @name speedfilesExtractor
 * @author Cufiy
 */

function speedfilesExtractor(sourcePageHtml) {
  // get var _0x5opu234 = "THIS_IS_AN_ENCODED_STRING"
  const REGEX = /var\s+_0x5opu234\s*=\s*"([^"]+)"/;
  const match = sourcePageHtml.match(REGEX);
  if (match == null || match[1] == null) {
    console.log("Could not extract from Speedfiles source");
    return null;
  }

  const encodedString = match[1];
  console.log("Encoded String:" + encodedString);

  // Step 1: Base64 decode the initial string
  let step1 = atob(encodedString);

  // Step 2: Swap character cases and reverse
  let step2 = step1
    .split("")
    .map((c) =>
      /[a-zA-Z]/.test(c)
        ? c === c.toLowerCase()
          ? c.toUpperCase()
          : c.toLowerCase()
        : c
    )
    .join("");
  let step3 = step2.split("").reverse().join("");

  // Step 3: Base64 decode again and reverse
  let step4 = atob(step3);
  let step5 = step4.split("").reverse().join("");

  // Step 4: Hex decode pairs
  let step6 = "";
  for (let i = 0; i < step5.length; i += 2) {
    step6 += String.fromCharCode(parseInt(step5.substr(i, 2), 16));
  }

  // Step 5: Subtract 3 from character codes
  let step7 = step6
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) - 3))
    .join("");

  // Step 6: Final case swap, reverse, and Base64 decode
  let step8 = step7
    .split("")
    .map((c) =>
      /[a-zA-Z]/.test(c)
        ? c === c.toLowerCase()
          ? c.toUpperCase()
          : c.toLowerCase()
        : c
    )
    .join("");
  let step9 = step8.split("").reverse().join("");

  // return atob(step9);
  let decodedUrl = atob(step9);
  return decodedUrl;
}

/* SCHEME END */