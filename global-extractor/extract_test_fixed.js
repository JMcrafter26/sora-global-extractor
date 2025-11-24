const fs = require('fs');
const path = require('path');
const readline = require('readline');

function getExtractors() {
    const extractorsDir = path.join(__dirname, '..', 'extractors');
    if (!fs.existsSync(extractorsDir)) return [];
    return fs.readdirSync(extractorsDir)
        .filter(f => f.endsWith('.js'))
        .map(f => f.slice(0, -3));
}

function detectExtractor(url) {
    const extractors = getExtractors();
    for (const extractor of extractors) {
        if (url.includes(extractor)) return extractor;
    }
    return null;
}

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

async function main() {
    const extractors = getExtractors();
    console.log('\nPlease enter a URL to extract:');
    const url = (await ask('> ')).trim();

    let extractorName;
    if (!url) {
        console.log('No URL provided.');
    } else {
        extractorName = detectExtractor(url);
        if (extractorName) {
            console.log(`Extractor found: ${extractorName}`);
        } else {
            console.log('No extractor found for the provided URL.\nPlease select from the available extractors:');
            extractors.forEach((ex, i) => console.log(`${i + 1}. ${ex}`));
            const choice = (await ask('Enter number: ')).trim();
            if (/^\d+$/.test(choice)) {
                const idx = parseInt(choice, 10) - 1;
                if (idx >= 0 && idx < extractors.length) {
                    extractorName = extractors[idx];
                    console.log(`Using extractor: ${extractorName}`);
                } else {
                    console.log('Invalid choice.');
                }
            } else {
                console.log('Invalid choice.');
            }
        }
    }

    if (!extractorName) {
        console.log('Exiting.');
        process.exit(0);
    }

    console.log(`Extracting using ${extractorName}...`);

    const extractorPath = path.join(__dirname, '..', 'extractors', `${extractorName}.js`);
    let mod;
    try {
        mod = require(extractorPath);
    } catch (err) {
        console.error('Failed to load extractor module:', err.message || err);
        process.exit(1);
    }

    let fn = null;
    if (typeof mod === 'function') fn = mod;
    else if (mod && typeof mod.extractStreamUrl === 'function') fn = mod.extractStreamUrl;
    else if (mod && typeof mod.default === 'function') fn = mod.default;
    else if (mod && typeof mod.extract === 'function') fn = mod.extract;

    if (!fn) {
        try {
            const vm = require('vm');
            const code = fs.readFileSync(extractorPath, 'utf8');
            const sandbox = {
                module: { exports: {} },
                exports: {},
                console: console,
                require: require,
                process: process,
                Buffer: Buffer,
                setTimeout: setTimeout,
                clearTimeout: clearTimeout,
                URL: URL,
                window: {},
                global: {}
            };
            sandbox.global = sandbox;
            sandbox.window = sandbox;

            const simpleFetch = (u, opts) => new Promise((resolve, reject) => {
                try {
                    const httpMod = u && u.toString().startsWith('https') ? require('https') : require('http');
                    const req = httpMod.get(u, res => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            const resp = {
                                ok: res.statusCode >= 200 && res.statusCode < 300,
                                status: res.statusCode,
                                headers: res.headers,
                                _data: data,
                                toString() { return this._data; },
                                [Symbol.toPrimitive](hint) { return this._data; }
                            };
                            // create a text function that is callable and thenable so strange extractor patterns work
                            const textFn = function() { return resp._data; };
                            textFn.then = (onFulfilled, onRejected) => Promise.resolve(resp._data).then(onFulfilled, onRejected);
                            const jsonFn = function() { return JSON.parse(resp._data); };
                            jsonFn.then = (onFulfilled, onRejected) => Promise.resolve(jsonFn()).then(onFulfilled, onRejected);
                            resp.text = textFn;
                            resp.json = jsonFn;
                            // forward string methods to underlying data so extractors can call html.match(...)
                            Object.getOwnPropertyNames(String.prototype).forEach(name => {
                                if (typeof String.prototype[name] === 'function' && !(name in resp)) {
                                    resp[name] = function(...args) { return String.prototype[name].apply(this._data, args); };
                                }
                            });
                            resolve(resp);
                        });
                    });
                    req.on('error', reject);
                } catch (e) {
                    reject(e);
                }
            });

            sandbox.fetch = sandbox.fetchv2 = simpleFetch;
            sandbox.atob = (s) => Buffer.from(s, 'base64').toString('binary');
            sandbox.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
            sandbox.globalThis = sandbox;

            const context = vm.createContext(sandbox);
            vm.runInContext(code, context, { filename: extractorPath });

            const sMod = sandbox.module && sandbox.module.exports ? sandbox.module.exports : sandbox.exports;
            if (typeof sMod === 'function') fn = sMod;
            else if (sandbox && typeof sandbox.extractStreamUrl === 'function') fn = sandbox.extractStreamUrl;
            else if (sandbox && typeof sandbox.default === 'function') fn = sandbox.default;
            else if (sandbox && typeof sandbox.extract === 'function') fn = sandbox.extract;
        } catch (err) {
            // ignore sandbox errors here; we'll report below if no callable found
        }
    }

    if (!fn) {
        console.error('Extractor does not export a callable function (expected function, extractStreamUrl, default, or extract).');
        process.exit(1);
    }

    let streamUrl;
    try {
        streamUrl = await Promise.resolve(fn(url));
    } catch (err) {
        console.error('Error while extracting stream URL:', err && err.message ? err.message : err);
        process.exit(1);
    }

    if (streamUrl) {
        console.log(`Extracted stream URL: ${streamUrl}`);
    } else {
        console.log('Failed to extract stream URL.');
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
