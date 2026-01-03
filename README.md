# 🎬 Sora Stream URL Extractor Collection

A comprehensive collection of JavaScript extractors for retrieving stream URLs from various hosting services. Designed specifically for integration with Sora iOS application modules.

[![License](https://api.jm26.net/b/License-Custom-blue)](./LICENSE)
[![Version](https://api.jm26.net/b/Version-1.2.0-green)](./global-extractor/VERSION.json)
[![Extractors](https://api.jm26.net/b/Extractors-24-orange)](#-available-extractors)

![Module Lib Badge](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/available/sora-module-library/cozy.svg)
![JavaScript Badge](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/built-with/javascript/cozy-minimal.svg)
![Python Badge](https://cdn.jsdelivr.net/gh/JMcrafter26/badges@main/src/assets/built-with/python/cozy-minimal.svg)

> [!CAUTION]
> This project is licensed **exclusively for use within the [Sora/Sulfur iOS app](https://github.com/cranci1/Sora) and it's modules** .
>
> **🚫 Do not pay to use modules — if someone is charging you or showing you ads to be able to use it, it's a scam!** 💸

<div align="center">
 <a href="https://sora.jm26.net"><kbd> <br> <strong>Get the Sora App</strong> <br> </kbd></a>
</div>

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [🎬 Sora Stream URL Extractor Collection](#-sora-stream-url-extractor-collection)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🚀 Quick Start](#-quick-start)
  - [📦 Available Extractors](#-available-extractors)
  - [🌐 Global Extractor](#-global-extractor)
    - [✅ Supported Extractors](#-supported-extractors)
    - [💡 Basic Usage](#-basic-usage)
    - [🔄 Multi Extractor (Recommended)](#-multi-extractor-recommended)
    - [🎯 Single Extractor (Legacy)](#-single-extractor-legacy)
    - [🔧 Direct URL Support](#-direct-url-support)
  - [⚡ Auto-Updater](#-auto-updater)
    - [📖 Usage Instructions](#-usage-instructions)
    - [🔄 Update Process](#-update-process)
  - [🛠️ Development](#️-development)
    - [Project Structure](#project-structure)
    - [Building the Global Extractor](#building-the-global-extractor)
    - [Running Tests](#running-tests)
    - [Contributing](#contributing)
  - [📝 Changelog](#-changelog)
  - [TODO](#todo)
  - [📄 License](#-license)

</details>

## ✨ Features

- 🎯 **Many Extractors**: Support for major streaming platforms
- 🔄 **Auto-Updates**: Automated extractor updates via Python script
- 🚀 **Multi-Threading**: Parallel extraction for better performance
- 🛡️ **Error Handling**: Robust error management and fallback options
- 📱 **Sora Integration**: Seamless integration with Sora iOS app
- 🔧 **Direct URL Support**: Handle direct video links alongside extractors

## 🚀 Quick Start

> [!Note]
> This guide assumes you have a basic understanding of JavaScript and Sora module development.
>
> If you are new to these concepts, consider [reading the Sora documentation](https://sora.jm26.net/docs) first.

1. **Choose your integration method:**
   - Use the [Global Extractor](#-global-extractor) for multiple providers (recommended)
   - Use individual extractors from the `extractors/` folder

2. **Copy the global extractor to your Sora module**

3. **Replace your `extractStreamUrl` function with the global extractor template**

4. **Configure your providers and start extracting!**

## 📦 Available Extractors

| Extractor | Author |
| --- | --- |
| [🌪️ TurboVid](./extractors/turbovid.js) | [Cufiy](https://github.com/JMcrafter26) |
| [🎥 VOE](./extractors/voe.js) | [ShadeOfChaos](https://github.com/ShadeOfChaos) |
| [🔄 BigWarp](./extractors/bigwarp.js) | [Cufiy](https://github.com/JMcrafter26) |
| [🌊 StreamWish](./extractors/streamwish.js) | [50/50](https://github.com/50n50) |
| [⚡ SpeedFiles](./extractors/speedfiles.js) | [Cufiy](https://github.com/JMcrafter26) |
| [📹 VidMoly](./extractors/vidmoly.js) | [Ibro](https://github.com/xibrox) |
| [🎬 DoodStream](./extractors/doodstream.js) | [Cufiy](https://github.com/JMcrafter26) |
| [📺 Vidoza](./extractors/vidoza.js) | [Cufiy](https://github.com/JMcrafter26) |
| [📤 MP4Upload](./extractors/mp4upload.js) | [Cufiy](https://github.com/JMcrafter26) |
| [🌙 FileMoon](./extractors/filemoon.js) | [Cufiy](https://github.com/JMcrafter26) & Churly |
| [☁️ MegaCloud](./extractors/megacloud.js) | [ShadeOfChaos](https://github.com/ShadeOfChaos) |
| [🎥 VK](./extractors/vk.js) | [scigward](https://github.com/scigward) |
| [📤 UQLoad](./extractors/uqload.js) | [scigward](https://github.com/scigward) |
| [🌐 Sibnet](./extractors/sibnet.js) | [scigward](https://github.com/scigward) |
| [💰 EarnVids](./extractors/earnvids.js) | [50/50](https://github.com/50n50) |
| [▶️ Dailymotion](./extractors/dailymotion.js) | [50/50](https://github.com/50n50) |
| [📁 FourShared](./extractors/new/fourshared.js) | [50/50](https://github.com/50n50) |
| [📤 OneUpload](./extractors/new/oneupload.js) | [50/50](https://github.com/50n50) |
| [🎞️ PlayerWish](./extractors/new/playerwish.js) | [50/50](https://github.com/50n50) |
| [📽️ SendVid](./extractors/new/sendvid.js) | [50/50](https://github.com/50n50) |
| [🌊 SmoothPre](./extractors/new/smoothpre.js) | [50/50](https://github.com/50n50) |
| [🎬 SuperVideo](./extractors/new/supervideo.js) | [50/50](https://github.com/50n50) |
| [📤 UploadCX](./extractors/new/uploadcx.js) | [50/50](https://github.com/50n50) |
| [🎦 VideosPK](./extractors/new/videospk.js) | [50/50](https://github.com/50n50) |
| [🌟 StreamUp](./extractors/streamup.js) | [Cufiy](https://github.com/JMcrafter26) |
| [🍓 LuluStream](./extractors/lulustream.js) | [Cufiy](https://github.com/JMcrafter26) |
| [📼 StreamTape](./extractors/streamtape.js) | [ShadeOfChaos](https://github.com/ShadeOfChaos) |
| [🏠 StreamHG](./extractors/streamhg.js) | [Cufiy](https://github.com/JMcrafter26) |
| [💾 SaveFiles](./extractors/savefiles.js) | [Cufiy](https://github.com/JMcrafter26) |
| [📦 Packer](./extractors/packer.js) | [Cufiy](https://github.com/JMcrafter26) |

> **Note**: All extractors are asynchronous. You can find out more about the individual extractors in their respective files.

## 🌐 Global Extractor

The global extractor is a unified solution that combines all available extractors into a single, easy-to-use function. It automatically handles provider detection, error management, and provides both single and multi-extraction capabilities.

**Location:** [`global-extractor/output/global_extractor.js`](./global-extractor/output/global_extractor.js)

### ✅ Supported Extractors

The global extractor supports the following extractors:

<!-- DO NOT EDIT THIS TABLE MANUALLY -->
<!-- This table is automatically generated by the build script. -->
<!-- EXTRACTORS_TABLE_START -->
| Extractor | Test Passed |
| -------- | ------- |
| vidmoly | ✅ |
| bigwarp | ✅ |
| filemoon | ✅ |
| doodstream | ✅ |
| voe | ✅ |
| vidoza | ✅ |
| mp4upload | ✅ |
| megacloud | ✅ |
| vk | ❌ |
| uqload | ✅ |
| sibnet | ✅ |
| earnvids | ✅ |
| dailymotion | ❌ |
| oneupload | ✅ |
| sendvid | ✅ |
| smoothpre | ✅ |
| supervideo | ❌ |
| uploadcx | ✅ |
| videospk | ✅ |
| streamup | ✅ |
| lulustream | ✅ |
| streamtape | ✅ |
| packer | ✅ |
| savefiles | ❌ |

> **Last updated**: January 03, 2026
>
> **Test Environment**: Automated CI/CD pipeline with real-world scenarios
>
> **Success Rate**: 83.33% (20/24 extractors passing)
<!-- EXTRACTORS_TABLE_END -->

### 💡 Basic Usage

To integrate the global extractor into your Sora module:

1. **Copy the global extractor file to your module directory**
2. **Replace your existing `extractStreamUrl` function** with the template provided
3. **Configure your providers object** with URLs and their corresponding extractor names
4. **Choose between single or multi-extraction modes**

### 🔄 Multi Extractor (Recommended)

The multi-extractor processes multiple providers simultaneously and returns all available streams. This approach provides better reliability and gives users more options.

```javascript
// Configure your providers
const providers = {
  "https://vidmoly.to/embed-preghvoypr2m.html": "vidmoly",
  "https://speedfiles.net/123456": "speedfiles", 
  "https://voe.sx/123456": "voe",
  "https://example.com/video.mp4": "direct-Premium", // Direct URLs supported
  "https://mp4upload.com/embed-xyz": "mp4upload-Backup" // Custom naming
};
let streams = [];
// Extract all available streams
try {
  streams = await multiExtractor(providers);
  let returnedStreams = {
    streams: streams,
  }

  console.log("Multi extractor streams: " + JSON.stringify(returnedStreams));
  return JSON.stringify(returnedStreams);
} catch (error) {
  console.log("Multi extractor error:" + error);
  return JSON.stringify([{ provider: "Error2", link: "" }]);
}
```

**Benefits:**

- ✅ Multiple stream options for users
- ✅ Automatic fallback if one provider fails  
- ✅ Parallel processing for better performance
- ✅ Support for custom provider naming

### 🎯 Single Extractor (Legacy)

The single extractor returns the first successfully extracted stream URL. Use this for backward compatibility or when you only need one stream.

```javascript
// You will need to get the stream Urls yourself 
// and put them in the providers object like this:
providers = {
  "https://vidmoly.to/embed-preghvoypr2m.html": "vidmoly",
  "https://speedfiles.net/123456": "speedfiles",
  "https://voe.sx/123456": "voe"
};

let streamUrl = null;
try {
  streamUrl = globalExtractor(providers);
} catch (error) {
  console.log("Global extractor error:" + error);
  return null;
}
```

### 🔧 Direct URL Support

The extractor supports direct video URLs alongside hosted providers:

```javascript
const providers = {
  // Regular extractors
  "https://vidmoly.to/embed-xyz": "vidmoly",
  
  // Direct URLs with custom names
  "https://cdn.example.com/video.mp4": "direct-CDN",
  "https://storage.example.com/movie.m3u8": "direct-HLS",
  
  // Direct URLs with automatic naming
  "https://example.com/stream.mp4": "direct"
};
```

**Provider Priority:** Providers are processed in the order they appear in the object. Place higher-priority providers first.

**Real-world Example:** Check out working implementations in the [Sora Modules Library](https://sora.jm26.net/library).

## ⚡ Auto-Updater

Since version 1.1.0, the collection includes an intelligent auto-updater that keeps your extractors current across all your Sora modules. The updater automatically scans your directory structure, identifies outdated extractors, and updates them to the latest version.

**Features:**

- 🔍 **Smart Detection**: Automatically finds all global extractor files
- 🔄 **Batch Updates**: Updates multiple modules simultaneously  
- 🛡️ **Version Validation**: Ensures version compatibility
- 🧹 **Legacy Detection**: Identifies and reports outdated extractor formats
- 📊 **Detailed Reporting**: Comprehensive update status and results

**Location:** [`global-extractor/update_global_extractor.py`](./global-extractor/update_global_extractor.py)

### 📖 Usage Instructions

1. **Prerequisites:**

   ```bash
   # Ensure Python 3.x is installed
   python --version
   ```

2. **Download the updater:**

   ```bash
   # Place in your Sora modules root directory
   wget https://raw.githubusercontent.com/JMcrafter26/sora-global-extractor/main/global-extractor/update_global_extractor.py
   ```

3. **Run the updater:**

   ```bash
   python update_global_extractor.py
   ```

### 🔄 Update Process

The updater follows a structured process:

1. **🌐 Version Check**: Fetches latest version from GitHub
2. **🔍 Directory Scan**: Recursively searches for extractor files
3. **📋 Version Analysis**: Compares current vs. latest versions  
4. **📥 Download**: Retrieves latest extractor code
5. **🔄 Update**: Replaces outdated extractors while preserving your custom code
6. **✅ Validation**: Confirms successful updates

**Sample Output:**

```bash
🚀 SORA GLOBAL EXTRACTOR UPDATER v1.0.0
============================================================
✅ Latest Version: 1.1.0
📁 JavaScript files scanned: 45
✅ Global extractor files found: 3
⚠️  Files needing updates: 2
🎉 All extractor files updated successfully!
```

## 🛠️ Development

### Project Structure

```structure
sora-streamurl-extractors/
├── extractors/           # Individual extractor implementations
├── global-extractor/     # Global extractor build system
│   ├── output/          # Generated global extractor files
│   ├── test/            # Test suite and validation
│   └── *.py             # Build and update scripts
├── global_extractor.js  # Main global extractor file
└── README.md            # This documentation
```

### Building the Global Extractor

```bash
cd global-extractor
python build.py
```

### Running Tests

```bash
cd global-extractor/test
node global_extractor_test.js
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-extractor`
3. Add your extractor to the `extractors/` folder
4. Update the build configuration
5. Test your changes
6. Submit a pull request

## 📝 Changelog

For detailed information about changes, improvements, and version history, see our [CHANGELOG.md](./CHANGELOG.md).

**Recent Updates:**

- **v1.2.0** (January 3, 2026): Added SaveFiles extractor, improved multi-extractor error handling
- **v1.1.9** (November 24, 2025): Added StreamHG and SaveFiles extractors, improved multi-extractor reliability
- **v1.1.8** (November 12, 2025): Fixed VK extractor, improved error handling
- **v1.1.7** (November 5, 2025): Added StreamTape extractor
- **v1.1.6** (October 29, 2025): Added 4shared, LuluStream, OneUpload, PlayerWish, SendVid, SmoothPre, StreamUp, SuperVideo, UploadCX, VideosPK extractors
- **v1.1.5** (September 18, 2025): Added Dailymotion and Earnvids extractors, removed Turbovid, improved error handling
- **v1.1.4** (August 13, 2025): Added Megacloud, Sibnet, UQLoad, and VK extractors, improved logging
- **v1.1.3** (July 23, 2025): Added plugin support to reduce redundant code, fixed filemoon extractor
- **v1.1.2** (July 22, 2025): Fixed filemoon, Removed SpeedFiled (Site is offline for a while now)
- **v1.1.1** (June 17, 2025): Direct URL support, enhanced auto-updater, custom provider naming
- **v1.1.0** (June 9, 2025): Multi-extractor support, global extractor system
- **v1.0.0**: Initial stable release with core extractors

## TODO

- [x] Use [Better multi return array](https://sora.jm26.net/docs/modules/module-functions/extractStreamUrl.html#multi-server-selector-recommended)
- [ ] Allow extractor to return multiple formats streams
- [ ] Subtitle support
- [ ] Add more extractors

## 📄 License

This project is licensed under a **Custom License** that restricts usage to the **Sora/Sulfur iOS application** ecosystem only.

**Key Points:**

- ✅ **Permitted**: Use within Sora/Sulfur iOS applications and modules
- ❌ **Prohibited**: Commercial redistribution, modification for other platforms
- 📖 **Full Terms**: See [LICENSE](./LICENSE) for complete details

---

<div align="center">

**Made with ❤️ for the Sora Community**

[🌐 Sora Modules Library](https://sora.jm26.net/library) • [📚 Documentation](https://sora.jm26.net/docs) • [📝 Changelog](./CHANGELOG.md) • [🐛 Report Issues](https://github.com/JMcrafter26/sora-streamurl-extractors/issues)

</div>
