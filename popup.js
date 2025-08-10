const openaiKeyInput = document.getElementById('openaiKey');
const geminiKeyInput = document.getElementById('geminiKey');
const changeKeyBtn = document.getElementById('changeKeyBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiSection = document.getElementById('apiSection');
const openaiEyeBtn = document.getElementById('openaiEyeBtn');
const geminiEyeBtn = document.getElementById('geminiEyeBtn');
const deleteOpenaiBtn = document.getElementById('deleteOpenaiBtn');
const deleteGeminiBtn = document.getElementById('deleteGeminiBtn');
const generateBtn = document.getElementById('generateBtn');
const generateSection = document.getElementById('generateSection');
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const modelDropdownBtn = document.getElementById('modelDropdownBtn');
const modelList = document.getElementById('modelList');
const dropdown = document.querySelector('.dropdown');
const openaiKeySection = document.getElementById('openaiKeySection');
const geminiKeySection = document.getElementById('geminiKeySection');
const customValuesBtn = document.getElementById('customValuesBtn');
const customValuesSection = document.getElementById('customValuesSection');
const addCustomValueBtn = document.getElementById('addCustomValueBtn');
const saveCustomValuesBtn = document.getElementById('saveCustomValuesBtn');
const customValuesList = document.getElementById('customValuesList');

let openaiKey = '';
let geminiKey = '';
let selectedModel = 'gpt-4o-mini';
let selectedProvider = 'openai';
let showOpenaiKey = false;
let showGeminiKey = false;
let tempOpenaiKey = '';
let tempGeminiKey = '';
let customValues = [];
let tempCustomValues = [];
let statusTimeout = null;
let isGenerating = false; // Flag to prevent multiple generations

function getMaskedKey(key) {
  return '•'.repeat(key.length);
}

function updateSelectedModelUI(model, provider) {
  modelDropdownBtn.textContent = `🤖 ${model}`;
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.value === model && opt.dataset.provider === provider) {
      opt.classList.add('selected');
    }
  });
}

function updateCustomValuesButtonText() {
  const count = customValues.length;
  if (count === 0) {
    customValuesBtn.innerHTML = '⚙️ Custom Prompt Values';
  } else {
    customValuesBtn.innerHTML = `⚙️ Custom Values (${count})`;
  }
}

function updateKeySectionVisibility() {
  // When key panel is closed, hide both sections
  if (apiSection.style.display === 'none') {
    openaiKeySection.classList.add('hidden');
    geminiKeySection.classList.add('hidden');
    return;
  }

  // When key panel is open, show both sections
  openaiKeySection.classList.remove('hidden');
  geminiKeySection.classList.remove('hidden');

  // Reset opacity and border for both sections
  openaiKeySection.style.opacity = '1';
  openaiKeySection.style.borderColor = 'var(--border-color)';
  geminiKeySection.style.opacity = '1';
  geminiKeySection.style.borderColor = 'var(--border-color)';
}

function createCustomValueItem(key = '', value = '') {
  const item = document.createElement('div');
  item.className = 'custom-value-item';

  // Create contenteditable key header
  const keyHeader = document.createElement('div');
  keyHeader.contentEditable = true;
  keyHeader.textContent = key || 'Enter key name here';
  keyHeader.className = 'key-header';

  // Create label for value
  const valueLabel = document.createElement('label');
  valueLabel.textContent = 'Description of key:';
  valueLabel.className = 'value-label';

  // Create value input
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Enter description here';
  valueInput.className = 'value-input';
  valueInput.value = value;
  valueInput.id = `description-${Date.now()}-${Math.random()}`;
  valueLabel.htmlFor = valueInput.id;

  // Create remove button with text and icon
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '🗑️ Remove Custom Property';
  removeBtn.onclick = () => item.remove();

  // Clear validation errors when input changes
  const clearValidation = () => {
    valueInput.style.borderColor = '';
  };

  valueInput.addEventListener('input', clearValidation);

  // Update key header when it changes
  keyHeader.addEventListener('input', () => {
    const currentText = keyHeader.textContent;

    // If completely empty, set default text
    if (!currentText.trim()) {
      keyHeader.textContent = 'Enter key name here';
      return;
    }

    // If the text contains the default text, remove it and keep only user input
    if (currentText.includes('Enter key name here')) {
      const userInput = currentText.replace('Enter key name here', '').trim();
      if (userInput) {
        // Save cursor position before replacing text
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorOffset = range.startOffset;

        // Replace the text
        keyHeader.textContent = userInput;

        // Restore cursor position at the end of the text
        const newRange = document.createRange();
        newRange.selectNodeContents(keyHeader);
        newRange.collapse(false); // false = collapse to end
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        keyHeader.textContent = 'Enter key name here';
        return;
      }
    }

    // Limit to 15 words max
    const words = currentText.trim().split(/\s+/);
    if (words.length > 15) {
      // Take first 15 words and add line breaks every 5 words for readability
      const limitedWords = words.slice(0, 15);
      const lines = [];
      for (let i = 0; i < limitedWords.length; i += 5) {
        lines.push(limitedWords.slice(i, i + 5).join(' '));
      }
      keyHeader.textContent = lines.join('\n');
    }
  });

  // Auto-remove empty items when they lose focus
  keyHeader.addEventListener('blur', () => {
    const key = keyHeader.textContent.trim();
    const valueInput = item.querySelector('.value-input');
    const value = valueInput.value.trim();

    // If both key and value are empty/default, remove the item
    if ((!key || key === 'Enter key name here') && !value) {
      item.remove();
    }
  });

  valueInput.addEventListener('blur', () => {
    const key = keyHeader.textContent.trim();
    const value = valueInput.value.trim();

    // If both key and value are empty/default, remove the item
    if ((!key || key === 'Enter key name here') && !value) {
      item.remove();
    }
  });

  // Add elements directly to item
  item.appendChild(keyHeader);
  item.appendChild(valueLabel);
  item.appendChild(valueInput);
  item.appendChild(removeBtn);

  return item;
}

function saveCustomValues() {
  tempCustomValues = [];
  const errors = [];

  // Get all custom value items from the DOM
  const items = customValuesList.querySelectorAll('.custom-value-item');

  items.forEach((item, index) => {
    const keyHeader = item.querySelector('.key-header');
    const valueInput = item.querySelector('.value-input');
    const key = keyHeader.textContent.trim();
    const value = valueInput.value.trim();

    // Check if key is empty or just the default text
    if (!key || key === 'Enter key name here') {
      // Remove completely empty items or items with default text
      if (!value) {
        item.remove(); // Remove the empty item from UI
        return;
      } else {
        // Has value but no valid key
        errors.push(`Row ${index + 1}: Key is required when value is provided`);
        keyHeader.style.borderColor = 'var(--error-color)';
        return;
      }
    }

    // Allow blank values for valid keys
    if (key && !value) {
      // Valid key with empty value - this is allowed
    }

    if (tempCustomValues.some(existing => existing.key === key)) {
      errors.push(`Duplicate key: "${key}"`);
      keyHeader.style.borderColor = 'var(--error-color)';
      return;
    }

    // Reset border color if valid
    keyHeader.style.borderColor = '';
    valueInput.style.borderColor = '';

    // Add the key-value pair (value can be empty)
    tempCustomValues.push({ key, value: value || '' });
  });

  if (errors.length > 0) {
    setStatus(`Validation errors: ${errors.join(', ')}`, 'red');
    return null;
  }

  return tempCustomValues;
}

function getCurrentKey() {
  return selectedProvider === 'openai' ? openaiKey : geminiKey;
}

function validateCurrentKey() {
  const currentKey = getCurrentKey();
  if (!currentKey) {
    const providerName = selectedProvider === 'openai' ? 'OpenAI' : 'Gemini';
    setStatus(
      `${providerName} API key is required for ${selectedModel}`,
      'red'
    );
    return false;
  }
  return true;
}

modelDropdownBtn.addEventListener('click', () => {
  dropdown.classList.toggle('open');
});

modelList.addEventListener('click', e => {
  if (e.target.classList.contains('option')) {
    const newModel = e.target.dataset.value;
    const newProvider = e.target.dataset.provider;

    selectedModel = newModel;
    selectedProvider = newProvider;

    updateSelectedModelUI(selectedModel, selectedProvider);
    updateKeySectionVisibility();
    dropdown.classList.remove('open');

    chrome.storage.local.set({
      selectedModel: selectedModel,
      selectedProvider: selectedProvider,
    });
  }
});

window.onload = () => {
  console.log('Popup loaded.');
  chrome.storage.local.get(
    [
      'openaiKey',
      'geminiKey',
      'selectedModel',
      'selectedProvider',
      'theme',
      'customValues',
    ],
    data => {
      if (data.openaiKey) {
        openaiKey = data.openaiKey;
        openaiKeyInput.value = getMaskedKey(openaiKey);
      } else {
        openaiKey = '';
        openaiKeyInput.value = '';
      }

      if (data.geminiKey) {
        geminiKey = data.geminiKey;
        geminiKeyInput.value = getMaskedKey(geminiKey);
      } else {
        geminiKey = '';
        geminiKeyInput.value = '';
      }

      if (data.customValues) {
        customValues = data.customValues;
        tempCustomValues = [...customValues];
      } else {
        // Start with empty custom values
        customValues = [];
        tempCustomValues = [];
      }

      console.log('Stored data loaded:', data);

      if (data.selectedModel) {
        selectedModel = data.selectedModel;
      } else {
        selectedModel = 'gpt-4o-mini';
      }

      if (data.selectedProvider) {
        selectedProvider = data.selectedProvider;
      } else {
        selectedProvider = 'openai';
      }

      updateSelectedModelUI(selectedModel, selectedProvider);
      updateKeySectionVisibility();
      updateCustomValuesButtonText();

      // Ensure generate section is visible on load
      generateSection.style.display = 'block';

      console.log(
        'Selected model set to:',
        selectedModel,
        'Provider:',
        selectedProvider
      );

      if (data.theme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '☀️ Enable Light Mode';
      } else {
        themeToggle.innerHTML = '🌙 Enable Dark Mode';
      }
    }
  );
};

changeKeyBtn.addEventListener('click', () => {
  const isPanelOpen = apiSection.style.display === 'block';

  if (!isPanelOpen) {
    apiSection.style.display = 'block';
    generateSection.style.display = 'none';
    changeKeyBtn.innerHTML = '🔼 Close Key Panel';
    updateKeySectionVisibility();

    // Show actual values when panel opens, not masked values
    openaiKeyInput.type = 'password';
    openaiKeyInput.value = tempOpenaiKey || openaiKey || '';

    geminiKeyInput.type = 'password';
    geminiKeyInput.value = tempGeminiKey || geminiKey || '';
  } else {
    apiSection.style.display = 'none';
    generateSection.style.display = 'block';
    changeKeyBtn.innerHTML = '🔑 Change API Keys';
  }

  setStatus('');
});

openaiEyeBtn.addEventListener('click', () => {
  showOpenaiKey = !showOpenaiKey;
  openaiKeyInput.type = showOpenaiKey ? 'text' : 'password';
  openaiKeyInput.value = showOpenaiKey
    ? tempOpenaiKey || openaiKey || ''
    : tempOpenaiKey || (openaiKey ? getMaskedKey(openaiKey) : '');
  openaiEyeBtn.textContent = showOpenaiKey ? '🙈 Hide Key' : '👁️ View Key';
});

geminiEyeBtn.addEventListener('click', () => {
  showGeminiKey = !showGeminiKey;
  geminiKeyInput.type = showGeminiKey ? 'text' : 'password';
  geminiKeyInput.value = showGeminiKey
    ? tempGeminiKey || geminiKey || ''
    : tempGeminiKey || (geminiKey ? getMaskedKey(geminiKey) : '');
  geminiEyeBtn.textContent = showGeminiKey ? '🙈 Hide Key' : '👁️ View Key';
});

openaiKeyInput.addEventListener('input', () => {
  tempOpenaiKey = openaiKeyInput.value;
});

geminiKeyInput.addEventListener('input', () => {
  tempGeminiKey = geminiKeyInput.value;
});

// Delete button functionality
deleteOpenaiBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete the OpenAI API key?')) {
    openaiKey = '';
    tempOpenaiKey = '';
    openaiKeyInput.value = '';
    chrome.storage.local.remove(['openaiKey'], () => {
      setStatus('OpenAI API key deleted!', 'green');
      console.log('OpenAI API key deleted.');
    });
  }
});

deleteGeminiBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete the Gemini API key?')) {
    geminiKey = '';
    tempGeminiKey = '';
    geminiKeyInput.value = '';
    chrome.storage.local.remove(['geminiKey'], () => {
      setStatus('Gemini API key deleted!', 'green');
      console.log('Gemini API key deleted.');
    });
  }
});

saveKeyBtn.addEventListener('click', () => {
  const newOpenaiKey = openaiKeyInput.value.trim();
  const newGeminiKey = geminiKeyInput.value.trim();

  console.log('Save button clicked:');
  console.log(
    'New OpenAI key:',
    newOpenaiKey ? '***' + newOpenaiKey.slice(-4) : 'empty'
  );
  console.log(
    'Current OpenAI key:',
    openaiKey ? '***' + openaiKey.slice(-4) : 'empty'
  );
  console.log(
    'New Gemini key:',
    newGeminiKey ? '***' + newGeminiKey.slice(-4) : 'empty'
  );
  console.log(
    'Current Gemini key:',
    geminiKey ? '***' + geminiKey.slice(-4) : 'empty'
  );

  // Check if keys have changed (including removal)
  const openaiKeyChanged = newOpenaiKey !== openaiKey;
  const geminiKeyChanged = newGeminiKey !== geminiKey;

  console.log('OpenAI key changed:', openaiKeyChanged);
  console.log('Gemini key changed:', geminiKeyChanged);

  if (!openaiKeyChanged && !geminiKeyChanged) {
    return setStatus('No keys were changed', 'orange');
  }

  const storageData = {};

  // Handle OpenAI key changes
  if (openaiKeyChanged) {
    if (newOpenaiKey) {
      storageData.openaiKey = newOpenaiKey;
      openaiKey = newOpenaiKey;
    } else {
      // Remove the key if it's empty
      storageData.openaiKey = null;
      openaiKey = '';
    }
    tempOpenaiKey = '';
  }

  // Handle Gemini key changes
  if (geminiKeyChanged) {
    if (newGeminiKey) {
      storageData.geminiKey = newGeminiKey;
      geminiKey = newGeminiKey;
    } else {
      // Remove the key if it's empty
      storageData.geminiKey = null;
      geminiKey = '';
    }
    tempGeminiKey = '';
  }

  chrome.storage.local.set(storageData, () => {
    apiSection.style.display = 'none';
    generateSection.style.display = 'block';
    generateBtn.style.display = 'block';
    changeKeyBtn.innerHTML = '�� Change API Keys';

    openaiKeyInput.value = openaiKey ? getMaskedKey(openaiKey) : '';
    geminiKeyInput.value = geminiKey ? getMaskedKey(geminiKey) : '';
    showOpenaiKey = false;
    showGeminiKey = false;
    openaiEyeBtn.textContent = '👁️ View Key';
    geminiEyeBtn.textContent = '👁️ View Key';

    setStatus('API keys saved!', 'green');
    console.log('API keys saved.');
  });
});

// Custom values functionality
customValuesBtn.addEventListener('click', () => {
  const isPanelOpen = customValuesSection.style.display === 'block';

  if (!isPanelOpen) {
    customValuesSection.style.display = 'block';
    generateSection.style.display = 'none';
    customValuesBtn.innerHTML = '🔼 Close Custom Values';

    // Initialize temp values with current values
    tempCustomValues = [...customValues];

    // Populate the DOM with existing custom values
    customValuesList.innerHTML = '';
    customValues.forEach(cv => {
      const item = createCustomValueItem(cv.key, cv.value);
      customValuesList.appendChild(item);
    });
  } else {
    customValuesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateCustomValuesButtonText();
  }

  setStatus('');
});

addCustomValueBtn.addEventListener('click', () => {
  const item = createCustomValueItem();
  customValuesList.appendChild(item);
});

saveCustomValuesBtn.addEventListener('click', () => {
  const newCustomValues = saveCustomValues();

  if (newCustomValues === null) {
    // Validation failed
    return;
  }

  // Allow saving even with no custom values
  if (newCustomValues.length === 0) {
    setStatus('No custom values added', 'blue');
  }

  customValues = [...newCustomValues];

  chrome.storage.local.set({ customValues: customValues }, () => {
    customValuesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateCustomValuesButtonText();

    setStatus('Custom values saved!', 'green');
    console.log('Custom values saved:', customValues);
  });
});

generateBtn.addEventListener('click', () => {
  console.log('Generate button clicked.');

  if (!validateCurrentKey()) {
    return;
  }

  // Prevent multiple generations
  if (isGenerating) {
    console.log('Generation already in progress, ignoring click.');
    return;
  }

  // Set generating flag
  isGenerating = true;

  // Disable the button to prevent repetitive clicks
  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Generating...';
  generateBtn.style.opacity = '0.6';
  generateBtn.style.cursor = 'not-allowed';

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setStatus('⏳ Sending request...');
    console.log(`Injecting content script into tab ${tab.id}.`);

    // Force-inject content.js before sending event
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['content.js'],
      },
      () => {
        // Check if content script is already loaded to prevent duplicate listeners
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => {
              // Check if we already have a listener for this request
              if (window.isProcessingPRRequest) {
                console.log(
                  'Content script already processing a request, skipping injection.'
                );
                return false;
              }
              return true;
            },
          },
          results => {
            if (
              chrome.runtime.lastError ||
              !results ||
              !results[0] ||
              !results[0].result
            ) {
              console.log('Content script already busy, skipping request.');
              enableGenerateButton();
              isGenerating = false;
              return;
            }

            // Prepare custom values - only use user-provided values
            let finalCustomValues = [];

            // Filter out completely empty entries
            if (customValues && customValues.length > 0) {
              console.log('Original custom values:', customValues);
              finalCustomValues = customValues.filter(
                cv => cv.key.trim() && cv.value.trim()
              );
              console.log('Filtered custom values:', finalCustomValues);
            } else {
              console.log('No custom values found in storage');
            }

            // Dispatch custom event once content script is loaded
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (key, model, provider, customVals) => {
                console.log('Content script received:', {
                  key: key ? '***' + key.slice(-4) : 'empty',
                  model,
                  provider,
                  customVals,
                });
                window.dispatchEvent(
                  new CustomEvent('ai-pr-gen', {
                    detail: {
                      apiKey: key,
                      model: model,
                      provider: provider,
                      customValues: customVals,
                    },
                  })
                );
              },
              args: [
                getCurrentKey(),
                selectedModel,
                selectedProvider,
                finalCustomValues,
              ],
            });

            // Start 10s timeout to auto-reload if stuck
            statusTimeout = setTimeout(() => {
              console.warn('No response from content script. Reloading tab.');
              chrome.tabs.reload(tab.id);
              // Re-enable button on timeout
              enableGenerateButton();
              isGenerating = false; // Reset the flag on timeout
            }, 10000);
          }
        );
      }
    );
  });
});

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
  themeToggle.innerHTML = isDark
    ? '☀️ Enable Light Mode'
    : '🌙 Enable Dark Mode';
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'ai-pr-gen-status') {
    clearTimeout(statusTimeout);
    console.log('Status message received:', msg.message);
    setStatus(msg.message.text, msg.message.color);

    // Re-enable button on success or error
    if (msg.message.type === 'success' || msg.message.type === 'error') {
      enableGenerateButton();
    }
  }
});

function setStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || 'var(--text)';
}

function enableGenerateButton() {
  generateBtn.disabled = false;
  generateBtn.textContent = '🤖 Generate PR Description';
  generateBtn.style.opacity = '1';
  generateBtn.style.cursor = 'pointer';
  isGenerating = false; // Reset the flag after generation
}
