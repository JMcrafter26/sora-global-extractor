# 📋 Changelog

All notable changes to the Sora Stream URL Extractor Collection will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.1] - 2025-06-17

### ✨ Added
- **Direct URL Support**: Native support for direct streaming links
  - `direct-CustomName` syntax for personalized stream names
  - Automatic fallback to "Direct" for unnamed direct URLs
  - Support for MP4, M3U8, and other direct stream formats
- **Custom Provider Naming**: Enhanced naming system for providers
  - Custom suffixes: `provider-CustomName` (e.g., `speedfiles-Backup`)
  - Automatic numbering for duplicate providers
- **Auto-Updater System**: Intelligent update management
  - Automatic detection of global extractor files
  - Version compatibility validation
  - Legacy extractor detection and warnings
  - Batch updating with progress reporting
- **Enhanced Documentation**: Comprehensive JSDoc comments
- **GitHub Integration**: Proper repository URLs and licensing info
- **StreamWish Extractor**: New extractor for StreamWish streaming service
- **Enhanced FileMoon Extractor**: Improved reliability and detection

### 🔄 Changed
- **License**: Migrated from MIT to Custom License for ecosystem protection
- **Header Information**: Updated with GitHub repository links
- **Build System**: Enhanced CLI with better error reporting
- **Error Handling**: More robust exception management across extractors
- **Performance**: Optimized parallel processing in multi-extractor mode
- **Code Structure**: Cleaner organization and improved maintainability

### 🐛 Fixed
- **VOE Extractor**: Enhanced JSON parsing and pattern matching
- **DoodStream**: Improved token handling and URL generation
- **BigWarp**: Better regex matching for source detection
- **Vidoza**: Updated source patterns for current website structure
- **MP4Upload**: Enhanced URL detection algorithm
- **Memory Leaks**: Fixed potential memory issues in long-running processes

### 🔐 Security
- **Input Validation**: Enhanced sanitization for all extractor inputs
- **Safe Execution**: Better sandboxing for extractor functions
- **License Protection**: Custom license to prevent unauthorized usage

### ⚠️ Known Issues
- **TurboVid Extractor**: Currently failing due to website changes (investigation ongoing)

---

## [1.1.0] - 2025-06-09

### ✨ Added
- **Multi-Extractor Support**: Parallel processing for multiple providers
- **Global Extractor System**: Unified extractor management
- **Error Recovery**: Automatic fallback mechanisms
- **Basic Auto-Updater**: Initial version of update system

### 🔄 Changed
- **Architecture**: Moved to global extractor approach
- **Performance**: Improved processing speed
- **Documentation**: Enhanced README and usage examples

### 🐛 Fixed
- **Memory Management**: Reduced memory footprint
- **Error Handling**: Better exception management
- **Cross-Platform**: Improved Windows and iOS compatibility

---

## [1.0.0] - 2025-05-XX

### ✨ Added
- **Initial Release**: First stable version
- **Core Extractors**: BigWarp, DoodStream, MP4Upload, SpeedFiles, VidMoly, Vidoza, VOE
- **Basic Global Extractor**: Simple unified interface
- **Sora Integration**: Native support for Sora iOS app

### 🔄 Changed
- **Project Structure**: Organized extractor files
- **Documentation**: Created comprehensive README

---

## Contributing to the Changelog

When contributing changes, please:

1. **Follow the format**: Use the established categories (Added, Changed, Fixed, Security, etc.)
2. **Be descriptive**: Explain what changed and why it matters to users
3. **Include breaking changes**: Mark any breaking changes clearly
4. **Update version numbers**: Follow semantic versioning
5. **Add dates**: Use YYYY-MM-DD format

### Categories Used

- **✨ Added**: New features
- **🔄 Changed**: Changes in existing functionality  
- **🐛 Fixed**: Bug fixes
- **🔐 Security**: Security improvements
- **⚠️ Deprecated**: Soon-to-be removed features
- **❌ Removed**: Removed features
- **📋 Documentation**: Documentation changes

---

<div align="center">

**Questions about changes?** [Open an issue](https://github.com/JMcrafter26/sora-streamurl-extractors/issues) or check the [README](./README.md)

</div>
