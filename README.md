# Stream URL Extractor Collection

This is a collection of tools to extract stream URLs from various streaming services. The tools are written in JavaScript and are made to use in a Sora module.

- [Stream URL Extractor Collection](#stream-url-extractor-collection)
  - [Available Extractors](#available-extractors)
  - [Example Usage](#example-usage)
  - [License](#license)


## Available Extractors

| Extractor | Author | Async |
| --- | --- | --- |
| [turbovid](./extractors/turbovid.js) | [JMcrafter26](https://github.com/JMcrafter26) | ✅ |
| [voe](./extractors/voe.js) | [ShadeOfChaos](https://github.com/ShadeOfChaos) | ✅ |
| [bigwarp](./extractors/bigwarp.js) | [JMcrafter26](https://github.com/JMcrafter26) | ✅ |
| [streamwish](./extractors/streamwish.js) | [50/50](https://github.com/50n50) | ✅ |

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