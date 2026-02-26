# 🤖 AI PR Generator

> A powerful browser extension that automatically generates professional Pull Request titles and descriptions using OpenAI's GPT models or Google's Gemini models by analyzing your GitHub commit messages and code diff.

[![Web Store](https://img.shields.io/badge/Web%20Store-Install-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/github-pr-scribe-ai/ajnplipmiafledgelgdajdfepjamafml/reviews)
[![Version](https://img.shields.io/badge/version-1.7.0-brightgreen.svg)](https://github.com/AiyushKumar07/ai-pr-extension)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- **💬 Intent-Aware Generation**: Automatically reads commit messages to understand **WHY** changes were made
- **🎯 Smart PR Analysis**: Analyzes both commit history and code diff for comprehensive understanding
- **🤖 Multiple AI Providers**: Support for both OpenAI GPT models and Google Gemini models
- **📝 Structured Output**: Generates PRs with conventional commit types and organized markdown descriptions
- **🎨 Modern Design System**: Beautiful UI with Outfit & Sora fonts, centered layouts, and professional styling
- **🌙 Dark/Light Theme**: Seamless theme switching with optimized color schemes for both modes
- **🔒 Secure**: Your API keys are stored locally and never shared
- **⚡ Fast**: Works instantly on GitHub compare pages
- **📱 Responsive**: Clean, modern interface that works on any screen size
- **🔄 Provider Switching**: Easily switch between OpenAI and Gemini models
- **⚙️ Custom Prompt Values**: Add project-specific context and personalization to your PR prompts
- **✨ Enhanced UX**: Prominent highlighting for important information and improved visual hierarchy
- **🔑 Advanced Key Management**: Individual delete buttons, view toggles, and secure storage
- **📋 Built-in Sections**: Automatic inclusion of relevant PR sections based on content analysis

## 🚀 Quick Start

### Installation

1. **From Web Store** (Soon)
   - Visit the [Web Store](https://chromewebstore.google.com/detail/github-pr-scribe-ai/ajnplipmiafledgelgdajdfepjamafml/reviews)
   - Click "Add to Browser"
   - The extension will be installed automatically

2. **Manual Installation** (Development)
   ```bash
   git clone https://github.com/AiyushKumar07/ai-pr-extension.git
   cd ai-pr-extension
   npm install
   # Open browser extensions page
   # Enable developer mode
   # Click "Load unpacked"
   # Select the extension folder
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
   - Click "💾 Save & Close"

## 🔑 Key Management

The extension provides comprehensive API key management with enhanced security features:

### **Adding Keys**

- Click "🔑 Change API Keys" to open the key management panel
- Enter your API keys in the respective input fields
- Use the eye button (👁️) to toggle visibility of your keys
- Click "💾 Save & Close" to save your changes

### **Deleting Keys**

- Click the "🗑️ Delete Key" button next to any key to remove it
- A confirmation dialog will appear to prevent accidental deletion
- Deleted keys are immediately removed from storage and the UI
- You can always add keys back later

### **Security Features**

- Keys are stored locally in your browser's secure storage
- Keys are masked by default for privacy
- Confirmation dialogs prevent accidental key deletion
- No keys are ever transmitted to external servers except for API calls
- Individual delete buttons for each provider

## ⚙️ Custom Prompt Values

The extension allows you to add custom key-value pairs that will be included in your PR generation prompts for better context and personalization.

### **Adding Custom Values**

1. Click "⚙️ Custom Prompt Values" to open the custom values panel
2. Click "➕ Add Custom Property" to add a new key-value pair
3. Enter a descriptive key (e.g., `project_name`, `team_name`, `coding_standards`)
4. Enter the corresponding value (e.g., `MyProject`, `Development Team`, `ESLint + Prettier`)
5. Click "💾 Save Custom Properties" to store your custom values

### **Example Custom Values**

- **project_name**: `MyProject` - Helps AI understand your project context
- **team_name**: `Development Team` - Provides team-specific context
- **coding_standards**: `ESLint + Prettier` - Guides AI on coding conventions
- **deployment_env**: `Production` - Helps with deployment-related PRs
- **tech_stack**: `React + Node.js` - Provides technology context

### **How It Works**

When you generate a PR description, the extension automatically includes your custom values in the prompt sent to the AI. This helps the AI generate more relevant and contextual PR descriptions that align with your project's specific requirements and standards.

### **Managing Custom Values**

- **Edit**: Click on any input field to modify existing values
- **Remove**: Click the 🗑️ button to delete individual values
- **Validation**: The extension validates that all keys are unique and both key and value are provided
- **Persistence**: Custom values are stored locally and persist between browser sessions
- **Auto-cleanup**: Empty or invalid entries are automatically removed

### **Built-in Optional Sections**

The extension automatically includes relevant sections when your PR contains specific content:

- **Approach**: Explain the approach, logic, or architectural decisions
- **Bug Fixes**: List the issue fixes if it's a bug fix
- **Refactoring**: List structural/code improvements if refactoring
- **Chores**: List tooling, dependency updates, or clean-up
- **Testing**: List test cases added/updated

## 💬 Intent-Aware PR Generation

The extension **always** reads your commit messages to understand the **intent and context** behind your changes. This is not optional - it's the core feature that makes this extension powerful.

### **How It Works**

For every PR generation, the extension:

1. **Reads all commit messages** from the GitHub compare page
2. **Extracts commit titles, bodies, and authors**
3. **Combines commits with code diff** for complete context
4. **Sends everything to AI** with instructions to focus on intent
5. **Generates descriptions that explain WHY**, not just what

### **Example: The Difference**

Imagine you made these commits:

```
feat: Add Redis caching layer
refactor: Optimize database queries
fix: Resolve connection pool leak
```

**What you get:**

```markdown
feat: Introduce caching to reduce database load and improve response times

**Purpose**: This PR addresses performance issues identified in production.
The database was experiencing high load (500+ QPS) during peak hours, causing
3-5s response times. This caching layer reduces DB queries by 80% and improves
response time to <500ms.

**Approach**: Implemented Redis caching with intelligent TTL policies and
optimized query patterns to check cache first before hitting the database.

**Key Changes**:

- Added Redis caching layer with 5-minute TTL for hot data
- Refactored queries to use cache-first pattern with automatic fallback
- Fixed connection pool leak that was causing memory issues
```

The AI understands from your commits that you were solving a **performance problem**, not just "adding code". This creates PR descriptions that tell the complete story.

### **Best Practices**

To maximize the quality of generated PRs:

1. **Write Descriptive Commit Messages**

   ```bash
   # ❌ Bad
   git commit -m "update queries"

   # ✅ Good
   git commit -m "refactor: Optimize queries to reduce DB load by 50%"
   ```

2. **Use Conventional Commits**

   ```bash
   feat: Add user authentication
   fix: Resolve race condition in cache
   refactor: Extract payment logic to service
   docs: Update API documentation
   ```

3. **Include Context in Commit Bodies**

   ```bash
   git commit -m "feat: Add Redis caching for API responses" -m "
   Our API was experiencing high load (500+ RPS) during peak hours,
   causing 3-5s response times. This caching layer reduces DB queries
   by 80% and improves response time to <500ms."
   ```

4. **Reference Issues When Relevant**

   ```bash
   git commit -m "fix: Resolve memory leak in WebSocket connections

   Closes #1234

   The connection pool was not properly cleaning up closed connections,
   leading to memory exhaustion after ~6 hours of runtime."
   ```

### **When Commits Aren't Available**

If the GitHub page doesn't show commits (rare cases), the extension automatically falls back to diff-only analysis. You'll still get good results, just without the intent context.

## 📖 How to Use

### Generating a PR

1. **Navigate to GitHub**
   - Go to any GitHub repository
   - Create a new pull request or navigate to the compare page
   - Make sure you're on a page with the URL pattern: `https://github.com/*/*/compare/*`

2. **Generate PR Content**
   - Click the AI PR Generator extension icon
   - Select your preferred AI model and provider (OpenAI or Gemini)
   - Click "🚀 Generate PR Description"
   - Watch as the AI reads your commits and diff

3. **Review and Submit**
   - The extension will automatically populate the PR title and description
   - Review the generated content
   - Make any necessary adjustments
   - Submit your pull request!

### Supported Models

**🔵 OpenAI Models:**

- **Budget:** gpt-5-nano, gpt-4.1-nano, gpt-4.1-mini
- **GPT-5 Series:** gpt-5.2, gpt-5.2-pro, gpt-5.1, gpt-5, gpt-5-pro, gpt-5-mini
- **Reasoning (o-series):** o4-mini, o3, o3-pro, o1, o1-pro
- **Premium:** gpt-4.1, gpt-4o, gpt-4

**🟡 Gemini Models:**

**Gemini 3 Series (Preview):**

- **gemini-3-pro-preview** - Advanced intelligence and agentic coding
- **gemini-3-flash-preview** - Frontier-class performance, cost-efficient

**Gemini 2.5 Series:**

- **gemini-2.5-pro** - Enhanced thinking and reasoning, multimodal, advanced coding
- **gemini-2.5-flash** - Adaptive thinking, cost efficiency
- **gemini-2.5-flash-lite** - Cost-efficient, low latency

**Gemini 2.0 Series:**

- **gemini-2.0-flash** - Next generation features, speed, realtime streaming
- **gemini-2.0-flash-lite** - Cost efficiency and low latency

**Gemini 1.5 Series:**

- **gemini-1.5-flash** - Fast and versatile performance
- **gemini-1.5-flash-8b** - High volume, lower intelligence tasks
- **gemini-1.5-pro** - High-quality responses

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Local Development Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/AiyushKumar07/ai-pr-extension.git
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
├── manifest.json          # Extension manifest (v1.6.0)
├── popup.html            # Extension popup UI with modern design
├── popup.js              # Popup functionality and custom values management
├── content.js            # Content script for GitHub integration
├── background.js         # Service worker
├── icons/                # Extension icons (16x16 to 512x512)
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

#### Custom Values Management

The extension provides a robust system for managing custom prompt properties:

```javascript
// Example: Creating custom value items
function createCustomValueItem(key = '', value = '') {
  const item = document.createElement('div');
  item.className = 'custom-value-item';

  // Contenteditable key header with validation
  const keyHeader = document.createElement('div');
  keyHeader.contentEditable = true;
  keyHeader.textContent = key || 'Enter key name here';

  // Value input with label
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Enter description here';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '🗑️ Remove Custom Property';

  return item;
}
```

## 🔧 Configuration

### Environment Variables

No environment variables are required. All configuration is done through the extension's UI.

### Extension Permissions

- `storage` - Store API keys and preferences locally
- `scripting` - Inject content scripts into GitHub pages
- `activeTab` - Access current tab for diff analysis

### Host Permissions

- `https://github.com/*` - Access GitHub pages
- `https://api.openai.com/*` - Make OpenAI API calls
- `https://generativelanguage.googleapis.com/*` - Make Gemini API calls

## 🎨 Customization

### Themes

The extension supports both light and dark themes. Toggle between them using the theme button in the popup.

### Typography & Design System

The extension features a modern, professional design system built with:

- **Outfit Font** (weights 100-900) - Primary text and UI elements
- **Sora Font** (weights 100-800) - Headings and display text
- **Responsive Layout** - Clean, centered section headers and organized content
- **Visual Hierarchy** - Prominent highlighting for important information like default values

### Styling

The UI uses CSS custom properties for easy theming and consistent design:

```css
:root {
  --font-family-primary:
    'Outfit', 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;
  --font-family-text:
    'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-display:
    'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --bg: #f5f5f5;
  --text: #111;
  --btn-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --btn-text: white;
  --accent-color: #667eea;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Enhanced UI Features

- **Centered Section Headers** - All section titles are properly centered for better visual balance
- **Prominent Defaults Highlight** - Special styling for default values that are always included
- **Interactive Elements** - Hover effects, smooth transitions, and responsive feedback
- **Accessibility** - High contrast ratios and clear visual hierarchy
- **Modern Buttons** - Enhanced button styling with gradients and hover effects
- **Responsive Inputs** - Better form controls with focus states and validation

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

6. **Custom Values Issues**
   - Ensure all keys are unique
   - Check that required fields are filled
   - Try refreshing the custom values panel

### Debug Mode

Enable debug logging by opening the browser console and looking for messages from the extension.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the Repository**

   ```bash
   git clone https://github.com/AiyushKumar07/ai-pr-extension.git
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
- [ ] Intent-aware generation correctly parses commits
- [ ] Graceful fallback when commits unavailable
- [ ] Theme switching works
- [ ] All UI elements are responsive
- [ ] Custom values functionality works
- [ ] Model selection works for both providers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing the AI models
- [Google AI](https://ai.google/) for Gemini models
- [GitHub](https://github.com/) for the platform integration
- [Browser Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for the extension framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AiyushKumar07/ai-pr-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AiyushKumar07/ai-pr-extension/discussions)
- **Email**: aiyushkanojia@gmail.com

## 📅 Changelog

### v1.7.0

- 💬 **Intent-Aware PR Generation (Always On)** - Core feature that always reads commit messages
- 🧠 **Intent-Based Analysis** - AI understands WHY changes were made, not just WHAT changed
- 🔄 **Smart Context Parsing** - Extracts commit titles, bodies, and authors automatically
- 📝 **Enhanced Prompts** - AI instructions optimized to leverage commit message context
- 🎯 **Superior PR Quality** - Generates contextual, meaningful PR descriptions by default
- 🚀 **Streamlined UX** - No toggles, no configuration - just works out of the box
- 📖 **Updated Documentation** - Comprehensive guide with best practices for commit messages

### v1.6.0

- ✨ **New Typography System** - Replaced Inter font with modern Outfit and Sora fonts
- 🎨 **Enhanced Visual Design** - Improved section header centering and overall layout
- 🔍 **Prominent Defaults Display** - Special highlighting for default values that are always included
- 🎯 **Better Visual Hierarchy** - Improved spacing, shadows, and interactive elements
- 📱 **Responsive Improvements** - Better mobile and desktop experience
- 🎨 **Modern UI Elements** - Enhanced buttons, inputs, and section styling
- ⚙️ **Advanced Custom Values** - Enhanced custom prompt properties with better validation and UI
- 🔑 **Improved Key Management** - Individual delete buttons and enhanced security features
- 📋 **Built-in Section Support** - Automatic inclusion of relevant PR sections

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
