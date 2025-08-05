# 🤖 AI PR Generator

> A powerful browser extension that automatically generates professional Pull Request titles and descriptions using OpenAI's GPT models or Google's Gemini models by analyzing your GitHub diff.

[![Web Store](https://img.shields.io/badge/Web%20Store-Install-blue?logo=google-chrome)](https://webstore.example.com/ai-pr-generator) [![SOON]]
[![Version](https://img.shields.io/badge/version-1.5-brightgreen.svg)](https://github.com/yourusername/ai-pr-extension)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- **🎯 Smart PR Generation**: Automatically analyzes your GitHub diff and generates meaningful PR titles and descriptions
- **🤖 Multiple AI Providers**: Support for both OpenAI GPT models and Google Gemini models
- **📝 Structured Output**: Generates PRs with conventional commit types and organized markdown descriptions
- **🎨 Dark/Light Theme**: Beautiful UI with theme switching capability
- **🔒 Secure**: Your API keys are stored locally and never shared
- **⚡ Fast**: Works instantly on GitHub compare pages
- **📱 Responsive**: Clean, modern interface that works on any screen size
- **🔄 Provider Switching**: Easily switch between OpenAI and Gemini models

## 🚀 Quick Start

### Installation

1. **From Web Store** (Soon)
   - Visit the [Web Store](https://chromewebstore.google.com/detail/github-pr-scribe-ai/ajnplipmiafledgelgdajdfepjamafml/reviews)
   - Click "Add to Browser"
   - The extension will be installed automatically

2. **Manual Installation** (Development)
   ```bash
   git clone https://github.com/yourusername/ai-pr-extension.git
   cd ai-pr-extension
   npm install
   click on extensions
   manage extensions
   enable developer mode
   load unpacked
   select folder containing the extension
   DONE !
   ```

### Setup

1. **Get API Keys**

   **For OpenAI:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (you'll need it for the extension)

   **For Gemini:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key (you'll need it for the extension)

2. **Configure Extension**
   - Click the extension icon in your browser toolbar
   - Click "🔑 Change API Keys"
   - Enter your OpenAI and/or Gemini API keys
   - Click "Close & Save Keys"

## 🔑 Key Management

The extension provides comprehensive API key management:

### **Adding Keys**

- Click "🔑 Change API Keys" to open the key management panel
- Enter your API keys in the respective input fields
- Use the eye button (👁️) to toggle visibility of your keys
- Click "Close & Save Keys" to save your changes

### **Deleting Keys**

- Click the "🗑️ Delete" button next to any key to remove it
- A confirmation dialog will appear to prevent accidental deletion
- Deleted keys are immediately removed from storage and the UI
- You can always add keys back later

### **Security Features**

- Keys are stored locally in your browser's secure storage
- Keys are masked by default for privacy
- Confirmation dialogs prevent accidental key deletion
- No keys are ever transmitted to external servers except for API calls

## 📖 How to Use

### Generating a PR

1. **Navigate to GitHub**
   - Go to any GitHub repository
   - Create a new pull request or navigate to the compare page
   - Make sure you're on a page with the URL pattern: `https://github.com/*/*/compare/*`

2. **Generate PR Content**
   - Click the AI PR Generator extension icon
   - Select your preferred AI model and provider (OpenAI or Gemini)
   - Click "🚀 Generate PR"
   - Wait for the AI to analyze your diff and generate content

3. **Review and Submit**
   - The extension will automatically populate the PR title and description
   - Review the generated content
   - Make any necessary adjustments
   - Submit your pull request!

### Supported Models

**🔵 OpenAI Models:**

- **GPT-4o-mini** (Recommended) - Fast and cost-effective
- **GPT-4o** - Latest model with enhanced capabilities
- **GPT-4.1** - High-performance model
- **GPT-3.5-turbo** - Good balance of speed and quality
- **GPT-o1-mini, GPT-o2-mini, GPT-o3-mini, GPT-o4-mini** - Advanced reasoning models
- **GPT-o1, GPT-o2, GPT-o3, GPT-o4** - Full performance models
- **GPT-o3-pro** - Premium multimodal model

**🟡 Gemini Models:**

**Gemini 2.5 Series:**

- **gemini-2.5-pro** - Enhanced thinking and reasoning, multimodal understanding, advanced coding
- **gemini-2.5-flash** - Adaptive thinking, cost efficiency

**Gemini 2.0 Series:**

- **gemini-2.0-flash** - Next generation features, speed, and realtime streaming
- **gemini-2.0-flash-lite** - Cost efficiency and low latency

**Gemini 1.5 Series:**

- **gemini-1.5-flash** - Fast and versatile performance across diverse tasks
- **gemini-1.5-flash-8b** - High volume and lower intelligence tasks
- **gemini-1.5-pro** - High-quality responses

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

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

3. **Load Extension in Browser**
   - Open your browser and go to the extensions page
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

Supports both OpenAI's Chat Completions API and Google's Gemini API with structured prompts for consistent output:

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

// Example: Gemini API call
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  }
);
```

## 🔧 Configuration

### Environment Variables

No environment variables are required. All configuration is done through the extension's UI.

### Extension Permissions

- `storage` - Store API keys and preferences locally
- `scripting` - Inject content scripts into GitHub pages
- `activeTab` - Access current tab for diff analysis
- `webRequest` - Make API calls to OpenAI and Gemini

### Host Permissions

- `https://github.com/*` - Access GitHub pages
- `https://api.openai.com/*` - Make OpenAI API calls
- `https://generativelanguage.googleapis.com/*` - Make Gemini API calls

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
   - Make sure you've entered your API key for the selected provider (OpenAI or Gemini)
   - Verify the key is valid and has sufficient credits
   - Check that you're using the correct key for the selected model

2. **"PR form not found" Error**
   - Ensure you're on a GitHub compare page (`https://github.com/*/*/compare/*`)
   - Refresh the page and try again

3. **Extension not working**
   - Check that the extension is enabled in your browser's extensions page
   - Try reloading the extension
   - Clear browser cache and cookies

4. **OpenAI API Errors**
   - Verify your OpenAI API key is correct
   - Check your OpenAI account for rate limits or billing issues
   - Ensure you have sufficient API credits

5. **Gemini API Errors**
   - Verify your Gemini API key is correct
   - Check your Google AI Studio account for rate limits
   - Ensure the selected Gemini model is available in your region
   - Some Gemini models may be experimental and require special access

6. **Provider-specific Issues**
   - Make sure you have the correct API key for the selected provider
   - Switch between OpenAI and Gemini models to test different providers
   - Check the status bar for provider-specific error messages

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
   - Load the extension in your browser
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
- [Browser Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for the extension framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AiyushKumar07/ai-pr-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AiyushKumar07/ai-pr-extension/discussions)
- **Email**: aiyushkanojia@gmail.com

## 📅 Changelog

### v1.5.0

- 🗑️ Added delete functionality for API keys
- ✨ Individual delete buttons for OpenAI and Gemini keys
- 🔒 Enhanced security with confirmation dialogs
- 🎨 Improved key management UI with better layout
- 📝 Updated documentation for key deletion feature
- 🐛 Fixed key management workflow

### v1.4.0

- 🧹 Removed all Gemini preview/experimental models for better stability
- ✨ Focused on production-ready Gemini models only
- 🔧 Updated content script to support stable model variants
- 📝 Updated documentation to reflect current stable model selection
- 🎯 Improved reliability by removing experimental features
- 🐛 Fixed model mapping for stable Gemini models

### v1.3.0

- ✨ Added comprehensive support for all Gemini 2.5, 2.0, and 1.5 models
- 🔄 Enhanced model organization with version-based grouping
- 📝 Updated documentation with detailed model descriptions
- 🎯 Improved model selection UI with better categorization
- 🔧 Updated content script to support all new Gemini model variants
- 🐛 Fixed model mapping for new Gemini models

### v1.2.0

- ✨ Added support for Google Gemini models
- 🔄 Implemented provider switching between OpenAI and Gemini
- 🔑 Enhanced API key management for multiple providers
- 🎨 Improved UI with visual provider indicators
- 📝 Updated documentation for dual provider support
- 🐛 Fixed key validation and error handling

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
