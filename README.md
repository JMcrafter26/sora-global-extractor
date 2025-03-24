# Stream URL Extractor Collection

This is a collection of tools to extract stream URLs from various streaming services. The tools are written in JavaScript and are made to use in a Sora module.

- [Stream URL Extractor Collection](#stream-url-extractor-collection)
  - [Available Extractors](#available-extractors)
  - [Example Usage](#example-usage)
  - [License](#license)


## Available Extractors

| Extractor | Description | Author | Async |
| --- | --- | --- | --- |
| [turbovid](./extractors/turbovid.js) | Extracts stream URLs from turbovid | [JMcrafter26](https://github.com/JMcrafter26) | ✅ |
| [voe](./extractors/voe.js) | Extracts stream URLs from voe | [Hamzo](https://github.com/hamzenis) | ✅ |
| [bigwarp](./extractors/bigwarp.js) | Extracts stream URLs from bigwarp | [JMcrafter26](https://github.com/JMcrafter26) | ✅ |

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