async function extractStreamUrl(url) {
  const language = "eng";
  try {
    const response = await fetch(url);
    const html = await response;
    const base64EmbedUrl = html.match(/main_origin = "([^"]+)"/)[1];
    const embedUrl = base64Decode(base64EmbedUrl);

    // 1. Extract critical variables from embed page
    const { mediaType, apKey, xxId } = await extractEmbedVariables(embedUrl);
    console.log(
      "mediaType:" + mediaType + " | apKey:" + apKey + " | xxId:" + xxId
    );

    // 2. Get decryption keys
    const juiceKeys = await fetchJuiceKeys(embedUrl);
    console.log("juiceKeys: " + juiceKeys.juice);

    // 3. Get encrypted video payload
    const encryptedPayload = await fetchEncryptedPayload(embedUrl, apKey, xxId);

   
    // 4. Decrypt and return final url
    const streamUrl = xorDecryptHex(encryptedPayload, juiceKeys.juice);

    if (!streamUrl) {
      throw new Error("Stream URL not found");
    }

    return streamUrl;
  } catch (error) {
    console.log("Extraction failed:" + error);
    return null;
  }
}

//   HELPERS
// Helper function to fetch the base64 encoded string
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

async function extractEmbedVariables(embedUrl) {
  const response = await fetch(embedUrl);
  // const html = await response.text();
  const html = await response;
  return {
    mediaType: getJsVarValue(html, "media_type"),
    // posterPath: getJsVarValue(html, 'posterPath'),
    apKey: getJsVarValue(html, "apkey"),
    dKey: getJsVarValue(html, "dakey"),
    xxId: getJsVarValue(html, "xxid"),
    xyId: getJsVarValue(html, "xyid"),
  };
}

async function fetchJuiceKeys(embedUrl) {
  const headers = `Referer=${embedUrl}|Origin=${embedUrl}`;

  const fetchUrl =
    base64Decode("aHR0cHM6Ly90dXJib3ZpZC5ldS9hcGkvY3Vja2VkLw==") + "juice_key";

  const vercelUrl = `https://sora-passthrough.vercel.app/passthrough?url=${fetchUrl}&headers=${headers} }`;

  const response = await fetch(vercelUrl);

  return await JSON.parse(response);
}

async function fetchEncryptedPayload(embedUrl, apKey, xxId) {
  const url =
    base64Decode("aHR0cHM6Ly90dXJib3ZpZC5ldS9hcGkvY3Vja2VkLw==") +
    "the_juice_v2/?" +
    apKey +
    "=" +
    xxId;
  console.log("url:", url);

  const headers = `Referer=${embedUrl}|Origin=${embedUrl}`;
  const vercelUrl = `https://sora-passthrough.vercel.app/passthrough?url=${url}&headers=${headers} }`;

  const response = await fetch(vercelUrl);

  const data = await JSON.parse(response);

  return data.data;
}

function xorDecryptHex(hexData, key) {
  if (!hexData) {
    throw new Error("hexData is undefined or null");
  }
  const buffer = new Uint8Array(
    hexData
      .toString()
      .match(/../g)
      .map((h) => parseInt(h, 16))
  );
  let decrypted = "";

  for (let i = 0; i < buffer.length; i++) {
    const keyByte = key.charCodeAt(i % key.length);
    decrypted += String.fromCharCode(buffer[i] ^ keyByte);
  }

  return decrypted;
}