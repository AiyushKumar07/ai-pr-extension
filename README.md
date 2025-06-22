# 🤖 AI PR Generator

> A powerful Chrome extension that automatically generates professional Pull Request titles and descriptions using OpenAI's GPT models by analyzing your GitHub diff.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chrome.google.com/webstore/detail/ai-pr-generator) [SOON]
[![Version](https://img.shields.io/badge/version-1.1-brightgreen.svg)](https://github.com/yourusername/ai-pr-extension)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- **🎯 Smart PR Generation**: Automatically analyzes your GitHub diff and generates meaningful PR titles and descriptions
- **🤖 Multiple AI Models**: Support for various OpenAI models (GPT-4, GPT-3.5, GPT-4o-mini)
- **📝 Structured Output**: Generates PRs with conventional commit types and organized markdown descriptions
- **🎨 Dark/Light Theme**: Beautiful UI with theme switching capability
- **🔒 Secure**: Your API key is stored locally and never shared
- **⚡ Fast**: Works instantly on GitHub compare pages
- **📱 Responsive**: Clean, modern interface that works on any screen size

## 🚀 Quick Start

### Installation

1. **From Chrome Web Store** (Recommended)

   - Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/ai-pr-generator)
   - Click "Add to Chrome"
   - The extension will be installed automatically

2. **Manual Installation** (Development)
   ```bash
   git clone https://github.com/yourusername/ai-pr-extension.git
   cd ai-pr-extension
   npm install
   ```

### Setup

1. **Get OpenAI API Key**

   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (you'll need it for the extension)

2. **Configure Extension**
   - Click the extension icon in your Chrome toolbar
   - Click "🔑 Change API Key"
   - Enter your OpenAI API key
   - Click "Close & Save Key"

## 📖 How to Use

### Generating a PR

1. **Navigate to GitHub**

   - Go to any GitHub repository
   - Create a new pull request or navigate to the compare page
   - Make sure you're on a page with the URL pattern: `https://github.com/*/*/compare/*`

2. **Generate PR Content**

   - Click the AI PR Generator extension icon
   - Select your preferred AI model (default: GPT-4o-mini)
   - Click "🚀 Generate PR"
   - Wait for the AI to analyze your diff and generate content

3. **Review and Submit**
   - The extension will automatically populate the PR title and description
   - Review the generated content
   - Make any necessary adjustments
   - Submit your pull request!

### Supported Models

- **GPT-4o-mini** (Recommended) - Fast and cost-effective
- **GPT-4** - Most capable, higher cost
- **GPT-3.5-turbo** - Good balance of speed and quality
- **GPT-4o** - Latest model with enhanced capabilities

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome browser

### Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/ai-pr-extension.git
   cd ai-pr-extension
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Load Extension in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `ai-pr-extension` folder

4. **Development Commands**

   ```bash
   # Format code with Prettier
   npm run format

   # Check formatting without changes
   npm run format:check

   # Lint code
   npm run lint
   ```

### Project Structure

```
ai-pr-extension/
├── manifest.json          # Extension manifest
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script for GitHub integration
├── background.js         # Service worker
├── icons/                # Extension icons
│   ├── icon_16x16.png
│   ├── icon_32x32.png
│   ├── icon_48x48.png
│   ├── icon_128x128.png
│   ├── icon_256x256.png
│   └── icon_512x512.png
├── .prettierrc           # Prettier configuration
├── .prettierignore       # Files to ignore in formatting
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
└── README.md             # This file
```

### Key Features Implementation

#### Diff Parsing

The extension intelligently parses GitHub diffs, excluding binary files and focusing on code changes:

```javascript
// Example: Parsing diff content
const diffData = files
  .map(file => {
    const filename = file.querySelector('.file-info a')?.title.trim();
    const diffContent =
      file.nextElementSibling.querySelector('.js-diff-table').innerText;
    return `File: ${filename}\n${diffContent}`;
  })
  .filter(Boolean)
  .join('\n\n');
```

#### AI Integration

Uses OpenAI's Chat Completions API with structured prompts for consistent output:

```javascript
// Example: OpenAI API call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: selectedModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  }),
});
```

## 🔧 Configuration

### Environment Variables

No environment variables are required. All configuration is done through the extension's UI.

### Extension Permissions

- `storage` - Store API keys and preferences locally
- `scripting` - Inject content scripts into GitHub pages
- `activeTab` - Access current tab for diff analysis
- `webRequest` - Make API calls to OpenAI

### Host Permissions

- `https://github.com/*` - Access GitHub pages
- `https://api.openai.com/*` - Make OpenAI API calls

## 🎨 Customization

### Themes

The extension supports both light and dark themes. Toggle between them using the theme button in the popup.

### Styling

The UI uses CSS custom properties for easy theming:

```css
:root {
  --bg: #f5f5f5;
  --text: #111;
  --btn-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --btn-text: white;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not set" Error**

   - Make sure you've entered your OpenAI API key in the extension popup
   - Verify the key is valid and has sufficient credits

2. **"PR form not found" Error**

   - Ensure you're on a GitHub compare page (`https://github.com/*/*/compare/*`)
   - Refresh the page and try again

3. **Extension not working**

   - Check that the extension is enabled in `chrome://extensions/`
   - Try reloading the extension
   - Clear browser cache and cookies

4. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account for rate limits or billing issues
   - Ensure you have sufficient API credits

### Debug Mode

Enable debug logging by opening the browser console and looking for messages from the extension.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the Repository**

   ```bash
   git clone https://github.com/yourusername/ai-pr-extension.git
   cd ai-pr-extension
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**

   - Follow the existing code style
   - Add tests if applicable
   - Update documentation

4. **Test Your Changes**

   - Load the extension in Chrome
   - Test on GitHub compare pages
   - Ensure all functionality works

5. **Submit a Pull Request**
   - Create a detailed description of your changes
   - Include screenshots if UI changes are made
   - Reference any related issues

### Code Style

- Use Prettier for code formatting
- Follow JavaScript best practices
- Add comments for complex logic
- Use meaningful variable and function names

### Testing

Before submitting a PR, please test:

- [ ] Extension loads without errors
- [ ] API key management works
- [ ] PR generation works on GitHub compare pages
- [ ] Theme switching works
- [ ] All UI elements are responsive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing the AI models
- [GitHub](https://github.com/) for the platform integration
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/) for the extension framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AiyushKumar07/ai-pr-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AiyushKumar07/ai-pr-extension/discussions)
- **Email**: aiyushkanojia@gmail.com

## 🔄 Changelog

### v1.1.0

- ✨ Added support for multiple OpenAI models
- 🎨 Implemented dark/light theme switching
- 🔒 Improved API key security
- 🐛 Fixed various UI bugs
- 📱 Enhanced responsive design

### v1.0.0

- 🎉 Initial release
- ✨ Basic PR generation functionality
- 🔑 API key management
- 🎨 Modern UI design

---

**Made with ❤️ by [Aiyush Kumar]**

If you find this extension helpful, please consider giving it a ⭐ on GitHub!
