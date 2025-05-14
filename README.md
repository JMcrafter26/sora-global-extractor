# Stream URL Extractor Collection

This is a collection of tools to extract stream URLs from various streaming services. The tools are written in JavaScript and are made to use in a Sora module.

- [Stream URL Extractor Collection](#stream-url-extractor-collection)
  - [Available Extractors](#available-extractors)
  - [Global Extractor](#global-extractor)
    - [Supported Extractors](#supported-extractors)
  - [Example Usage](#example-usage)
  - [License](#license)


## Available Extractors

| Extractor | Author | Async |
| --- | --- | --- |
| [turbovid](./extractors/turbovid.js) | [Cufiy](https://github.com/JMcrafter26) | ✅ |
| [voe](./extractors/voe.js) | [ShadeOfChaos](https://github.com/ShadeOfChaos) | ✅ |
| [bigwarp](./extractors/bigwarp.js) | [Cufiy](https://github.com/JMcrafter26) | ✅ |
| [streamwish](./extractors/streamwish.js) | [50/50](https://github.com/50n50) | ✅ |
| [SpeedFiles](./extractors/speedfiles.js) | [Cufiy](https://github.com/JMcrafter26) | ✅ |
| [Vidmoly](./extractors/vidmoly.js) | [Ibro](https://github.com/xibrox) | ✅ |
| [DoodStream](./extractors/doodstream.js) | [Cufiy](https://github.com/JMcrafter26) | ✅ |

## Global Extractor

The global extractor is a function that can be used to extract stream URLs from any of the available extractors.

You can find the global extractor [here](./global-extractor/output/global_extractor.js).

### Supported Extractors









<!-- EXTRACTORS_TABLE_START -->
| Extractor | Test Passed |
| -------- | ------- |
| speedfiles | ✅ |
| vidmoly | ✅ |
| filemoon | ❌ |
| doodstream | ❌ |
| voe | ✅ |
<!-- EXTRACTORS_TABLE_END -->


## Example Usage

```javascript
const embedUrl = "https://somehoster.com/embed/123456";
const streamUrl = await extractStreamUrl(embedUrl);
console.log(streamUrl);
```

The result will be the stream URL of the video.


You can find these extractors in action in the [Sora Modules Library](https://sora.jm26.net/library).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.