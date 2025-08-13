async function extractStreamUrl(url) {
	let streamData = null;

	try {
		streamData = await megacloudExtractor(url);
		if (streamData?.status != true) {
			throw new Error("Rejected by server");
		}
		if (streamData?.result?.sources?.length === 0) {
			throw new Error("No stream URL found");
		}
		streamData = streamData.result;

	} catch (error) {
		console.log("Megacloud extraction error:", error);
		return null;
	}

	// You may want to adjust this depending on the actual structure
	if (streamData && typeof streamData === "object") {
		// Try to find a stream URL in the result
		const streamUrl = streamData.sources[0].file;
		if (streamUrl) {
			console.log("MegaCloud Stream URL: " + streamUrl);
			return streamUrl;
		}
		console.log("No stream URL found in the decoded JSON");
		return null;
	}

	console.log("No stream URL found");
	return null;
}

/* SCHEME START */

/**
 * @name megacloudExtractor
 * @author ShadeOfChaos
 */


// Megacloud V3 specific
async function megacloudExtractor(html, embedUrl) {
	const CHARSET = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32));

	const xraxParams = embedUrl.split('/').pop();
	const xrax = xraxParams.includes('?') ? xraxParams.split('?')[0] : xraxParams;
	const nonce = await getNonce(embedUrl);

	// return decrypt(secretKey, nonce, encryptedText);

	try {
		const response = await fetch(`https://megacloud.blog/embed-2/v3/e-1/getSources?id=${xrax}&_k=${nonce}`);
		const rawSourceData = await response.json();
		const encrypted = rawSourceData?.sources;
		let decryptedSources = null;

		if (rawSourceData?.encrypted == false) {
			decryptedSources = rawSourceData.sources;
		}

		if (decryptedSources == null) {
			decryptedSources = await getDecryptedSourceV3(encrypted, nonce);
			if (!decryptedSources) throw new Error("Failed to decrypt source");
		}

		console.log("Decrypted sources:" + JSON.stringify(decryptedSources, null, 2));

		// return the first source if it's an array
		if (Array.isArray(decryptedSources) && decryptedSources.length > 0) {
			try {
				return decryptedSources[0].file;
			} catch (error) {
				console.log("Error extracting MegaCloud stream URL:" + error);
				return null;
			}
		}

		// return {
		// 	status: true,
		// 	result: {
		// 		sources: decryptedSources,
		// 		tracks: rawSourceData.tracks,
		// 		intro: rawSourceData.intro ?? null,
		// 		outro: rawSourceData.outro ?? null,
		// 		server: rawSourceData.server ?? null
		// 	}
		// }
	} catch (error) {
		console.error(`[ERROR][decryptSources] Error decrypting ${embedUrl}:`, error);
		return {
			status: false,
			error: error?.message || 'Failed to get HLS link'
		};
	}

	/**
	 * Computes a key based on the given secret and nonce.
	 * The key is used to "unlock" the encrypted data.
	 * The computation of the key is based on the following steps:
	 * 1. Concatenate the secret and nonce.
	 * 2. Compute a hash value of the concatenated string using a simple
	 *    hash function (similar to Java's String.hashCode()).
	 * 3. Compute the remainder of the hash value divided by the maximum
	 *    value of a 64-bit signed integer.
	 * 4. Use the result as a XOR mask to process the characters of the
	 *    concatenated string.
	 * 5. Rotate the XOR-processed string by a shift amount equal to the
	 *    hash value modulo the length of the XOR-processed string plus 5.
	 * 6. Interleave the rotated string with the reversed nonce string.
	 * 7. Take a substring of the interleaved string of length equal to 96
	 *    plus the hash value modulo 33.
	 * 8. Convert each character of the substring to a character code
	 *    between 32 and 126 (inclusive) by taking the remainder of the
	 *    character code divided by 95 and adding 32.
	 * 9. Join the resulting array of characters into a string and return it.
	 * @param {string} secret - The secret string
	 * @param {string} nonce - The nonce string
	 * @returns {string} The computed key
	 */
	function computeKey(secret, nonce) {
		const secretAndNonce = secret + nonce;
		let hashValue = 0n;

		for (const char of secretAndNonce) {
			hashValue = BigInt(char.charCodeAt(0)) + hashValue * 31n + (hashValue << 7n) - hashValue;
		}

		const maximum64BitSignedIntegerValue = 0x7fffffffffffffffn;
		const hashValueModuloMax = hashValue % maximum64BitSignedIntegerValue;

		const xorMask = 247;
		const xorProcessedString = [...secretAndNonce]
			.map(char => String.fromCharCode(char.charCodeAt(0) ^ xorMask))
			.join('');

		const xorLen = xorProcessedString.length;
		const shiftAmount = (Number(hashValueModuloMax) % xorLen) + 5;
		const rotatedString = xorProcessedString.slice(shiftAmount) + xorProcessedString.slice(0, shiftAmount);

		const reversedNonceString = nonce.split('').reverse().join('');

		let interleavedString = '';
		const maxLen = Math.max(rotatedString.length, reversedNonceString.length);
		for (let i = 0; i < maxLen; i++) {
			interleavedString += (rotatedString[i] || '') + (reversedNonceString[i] || '');
		}

		const length = 96 + (Number(hashValueModuloMax) % 33);
		const partialString = interleavedString.substring(0, length);

		return [...partialString]
			.map(ch => String.fromCharCode((ch.charCodeAt(0) % 95) + 32))
			.join('');
	}

	/**
	 * Encrypts a given text using a columnar transposition cipher with a given key.
	 * The function arranges the text into a grid of columns and rows determined by the key length,
	 * fills the grid column by column based on the sorted order of the key characters,
	 * and returns the encrypted text by reading the grid row by row.
	 * 
	 * @param {string} text - The text to be encrypted.
	 * @param {string} key - The key that determines the order of columns in the grid.
	 * @returns {string} The encrypted text.
	 */
	function columnarCipher(text, key) {
		const columns = key.length;
		const rows = Math.ceil(text.length / columns);

		const grid = Array.from({ length: rows }, () => Array(columns).fill(''));
		const columnOrder = [...key]
			.map((char, idx) => ({ char, idx }))
			.sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));

		let i = 0;
		for (const { idx } of columnOrder) {
			for (let row = 0; row < rows; row++) {
				grid[row][idx] = text[i++] || '';
			}
		}

		return grid.flat().join('');
	}

	/**
	 * Deterministically unshuffles an array of characters based on a given key phrase.
	 * The function simulates a pseudo-random shuffling using a numeric seed derived
	 * from the key phrase. This ensures that the same character array and key phrase
	 * will always produce the same output, allowing for deterministic "unshuffling".
	 * @param {Array} characters - The array of characters to unshuffle.
	 * @param {string} keyPhrase - The key phrase used to generate the seed for the 
	 *                             pseudo-random number generator.
	 * @returns {Array} A new array representing the deterministically unshuffled characters.
	 */
	function deterministicUnshuffle(characters, keyPhrase) {
		let seed = [...keyPhrase].reduce((acc, char) => (acc * 31n + BigInt(char.charCodeAt(0))) & 0xffffffffn, 0n);

		const randomNumberGenerator = (upperLimit) => {
			seed = (seed * 1103515245n + 12345n) & 0x7fffffffn;
			return Number(seed % BigInt(upperLimit));
		};

		const shuffledCharacters = characters.slice();
		for (let i = shuffledCharacters.length - 1; i > 0; i--) {
			const j = randomNumberGenerator(i + 1);
			[shuffledCharacters[i], shuffledCharacters[j]] = [shuffledCharacters[j], shuffledCharacters[i]];
		}

		return shuffledCharacters;
	}

	/**
	 * Decrypts an encrypted text using a secret key and a nonce through multiple rounds of decryption.
	 * The decryption process includes base64 decoding, character substitution using a pseudo-random 
	 * number generator, a columnar transposition cipher, and deterministic unshuffling of the character set.
	 * Finally, it extracts and parses the decrypted JSON string or verifies it using a regex pattern.
	 * 
	 * @param {string} secretKey - The key used to decrypt the text.
	 * @param {string} nonce - A nonce for additional input to the decryption key.
	 * @param {string} encryptedText - The text to be decrypted, encoded in base64.
	 * @param {number} [rounds=3] - The number of decryption rounds to perform.
	 * @returns {Object|null} The decrypted JSON object if successful, or null if parsing fails.
	 */
	function decrypt(secretKey, nonce, encryptedText, rounds = 3) {
		let decryptedText = Buffer.from(encryptedText, 'base64').toString('utf-8');
		const keyPhrase = computeKey(secretKey, nonce);

		for (let round = rounds; round >= 1; round--) {
			const encryptionPassphrase = keyPhrase + round;

			let seed = [...encryptionPassphrase].reduce((acc, char) => (acc * 31n + BigInt(char.charCodeAt(0))) & 0xffffffffn, 0n);
			const randomNumberGenerator = (upperLimit) => {
				seed = (seed * 1103515245n + 12345n) & 0x7fffffffn;
				return Number(seed % BigInt(upperLimit));
			};

			decryptedText = [...decryptedText]
				.map(char => {
					const charIndex = CHARSET.indexOf(char);
					if (charIndex === -1) return char;
					const offset = randomNumberGenerator(95);
					return CHARSET[(charIndex - offset + 95) % 95];
				})
				.join('');

			decryptedText = columnarCipher(decryptedText, encryptionPassphrase);

			const shuffledCharset = deterministicUnshuffle(CHARSET, encryptionPassphrase);
			const mappingArr = {};
			shuffledCharset.forEach((c, i) => (mappingArr[c] = CHARSET[i]));
			decryptedText = [...decryptedText].map(char => mappingArr[char] || char).join('');
		}
		const lengthString = decryptedText.slice(0, 4);
		let length = parseInt(lengthString, 10);
		if (isNaN(length) || length <= 0 || length > decryptedText.length - 4) {
			console.error('Invalid length in decrypted string');
			return decryptedText;
		}

		const decryptedString = decryptedText.slice(4, 4 + length);

		try {
			return JSON.parse(decryptedString);
		} catch (e) {
			console.warn('Could not parse decrypted string, unlikely to be valid. Using regex to verify');
			const regex = /"file":"(.*?)".*?"type":"(.*?)"/;
			const match = encryptedText.match(regex);
			const matchedFile = match?.[1];
			const matchType = match?.[2];

			if (!matchedFile || !matchType) {
				console.error('Could not match file or type in decrypted string');
				return null;
			}

			return decryptedString;
		}
	}

	/**
   * Tries to extract the MegaCloud nonce from the given embed URL.
   * 
   * Fetches the HTML of the page, and tries to extract the nonce from it.
   * If that fails, it sends a request with the "x-requested-with" header set to "XMLHttpRequest"
   * and tries to extract the nonce from that HTML.
   * 
   * If all else fails, it logs the HTML of both requests and returns null.
   * 
   * @param {string} embedUrl The URL of the MegaCloud embed
   * @returns {string|null} The extracted nonce, or null if it couldn't be found
   */
	async function getNonce(embedUrl) {
		const res = await fetch(embedUrl, { headers: { "referer": "https://anicrush.to/", "x-requested-with": "XMLHttpRequest" } });
		const html = await res.text();

		const match0 = html.match(/\<meta[\s\S]*?name="_gg_fb"[\s\S]*?content="([\s\S]*?)">/);
		if (match0?.[1]) {
			return match0[1];
		}

		const match1 = html.match(/_is_th:(\S*?)\s/);
		if (match1?.[1]) {
			return match1[1];
		}

		const match2 = html.match(/data-dpi="([\s\S]*?)"/);
		if (match2?.[1]) {
			return match2[1];
		}

		const match3 = html.match(/_lk_db[\s]?=[\s\S]*?x:[\s]"([\S]*?)"[\s\S]*?y:[\s]"([\S]*?)"[\s\S]*?z:[\s]"([\S]*?)"/);
		if (match3?.[1] && match3?.[2] && match3?.[3]) {
			return "" + match3[1] + match3[2] + match3[3];
		}

		const match4 = html.match(/nonce="([\s\S]*?)"/);
		if (match4?.[1]) {
			if (match4[1].length >= 32) return match4[1];
		}

		const match5 = html.match(/_xy_ws = "(\S*?)"/);
		if (match5?.[1]) {
			return match5[1];
		}

		const match6 = html.match(/[a-zA-Z0-9]{48}]/);
		if (match6?.[1]) {
			return match6[1];
		}

		return null;
	}

	async function getDecryptedSourceV3(encrypted, nonce) {
		let decrypted = null;
		const keys = await asyncGetKeys();

		for(let key in keys) {
			try {
				if (!encrypted) {
					console.log("Encrypted source missing in response")
					return null;
				}

				decrypted = decrypt(keys[key], nonce, encrypted);

				if(!Array.isArray(decrypted) || decrypted.length <= 0) {
					// Failed to decrypt source
					continue;
				}

				for(let source of decrypted) {
					if(source != null && source?.file?.startsWith('https://')) {
						// Malformed decrypted source
						continue;
					}
				}

				console.log("Functioning key:", key);
				return decrypted;

			} catch(error) {
				console.error('Error:', error);
				console.error(`[${ new Date().toLocaleString() }] Key did not work: ${ key }`);
				continue;
			}
		}

		return null;
	}

	async function asyncGetKeys() {
		const resolution = await Promise.allSettled([
			fetchKey("ofchaos", "https://ac-api.ofchaos.com/api/key"),
			fetchKey("yogesh", "https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json"),
			fetchKey("esteven", "https://raw.githubusercontent.com/carlosesteven/e1-player-deobf/refs/heads/main/output/key.json")
		]);

		const keys = resolution.filter(r => r.status === 'fulfilled' && r.value != null).reduce((obj, r) => {
			let rKey = Object.keys(r.value)[0];
			let rValue = Object.values(r.value)[0];

			if (typeof rValue === 'string') {
				obj[rKey] = rValue.trim();
				return obj;
			}

			obj[rKey] = rValue?.mega ?? rValue?.decryptKey ?? rValue?.MegaCloud?.Anime?.Key ?? rValue?.megacloud?.key ?? rValue?.key ?? rValue?.megacloud?.anime?.key ?? rValue?.megacloud;
			return obj;
		}, {});

		if (keys.length === 0) {
			throw new Error("Failed to fetch any decryption key");
		}

		return keys;
	}

	function fetchKey(name, url, timeout = 1000) {
		return new Promise(async (resolve) => {
			try {
				const response = await fetch(url, { method: 'get', timeout: timeout });
				const key = await response.text();
				let trueKey = null;

				try {
					trueKey = JSON.parse(key);
				} catch (e) {
					trueKey = key;
				}

				resolve({ [name]: trueKey })
			} catch (error) {
				resolve(null);
			}
		});
	}
}
/* SCHEME END */
