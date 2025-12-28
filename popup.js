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
const templatesBtn = document.getElementById('templatesBtn');
const templatesSection = document.getElementById('templatesSection');
const templateDropdown = document.getElementById('templateDropdown');
const templatePreview = document.getElementById('templatePreview');
const customTemplateEditor = document.getElementById('customTemplateEditor');
const addMandatoryFieldBtn = document.getElementById('addMandatoryFieldBtn');
const addOptionalFieldBtn = document.getElementById('addOptionalFieldBtn');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const customFieldsList = document.getElementById('customFieldsList');

let openaiKey = '';
let geminiKey = '';
let selectedModel = 'gpt-4o-mini';
let selectedProvider = 'openai';
let showOpenaiKey = false;
let showGeminiKey = false;
let tempOpenaiKey = '';
let tempGeminiKey = '';
let selectedTemplate = 'default';
let customTemplate = { mandatory: [], optional: [] };
let statusTimeout = null;
let isGenerating = false;

// Define built-in templates
const templates = {
  default: {
    name: 'Default (Comprehensive)',
    mandatory: ['Purpose', 'Key Files Changed', 'Summary of Changes', 'Notes'],
    optional: ['Approach', 'Bug Fixes', 'Refactoring', 'Chores', 'Testing']
  },
  minimal: {
    name: 'Minimal (Quick)',
    mandatory: ['Summary', 'Changes'],
    optional: ['Screenshots', 'Checklist']
  }
};

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

function updateTemplatesButtonText() {
  const templateName = selectedTemplate === 'custom' ? 'Custom' : templates[selectedTemplate]?.name || 'Default';
  templatesBtn.innerHTML = `📋 Template: ${templateName}`;
}

function renderTemplatePreview(templateType) {
  const template = templateType === 'custom' ? customTemplate : templates[templateType];
  if (!template) return;

  const fieldsDiv = templatePreview.querySelector('.template-fields');
  fieldsDiv.innerHTML = '';

  // Render mandatory fields
  if (template.mandatory && template.mandatory.length > 0) {
    const mandatorySection = document.createElement('div');
    mandatorySection.style.marginBottom = '15px';
    mandatorySection.innerHTML = '<strong style="color: var(--primary)">** Mandatory Fields:</strong>';
    const mandatoryList = document.createElement('ul');
    mandatoryList.style.marginLeft = '20px';
    mandatoryList.style.marginTop = '5px';
    template.mandatory.forEach(field => {
      const li = document.createElement('li');
      li.textContent = field;
      mandatoryList.appendChild(li);
    });
    mandatorySection.appendChild(mandatoryList);
    fieldsDiv.appendChild(mandatorySection);
  }

  // Render optional fields
  if (template.optional && template.optional.length > 0) {
    const optionalSection = document.createElement('div');
    optionalSection.innerHTML = '<strong style="color: var(--secondary);"># Optional Fields:</strong>';
    const optionalList = document.createElement('ul');
    optionalList.style.marginLeft = '20px';
    optionalList.style.marginTop = '5px';
    optionalList.style.opacity = '0.8';
    template.optional.forEach(field => {
      const li = document.createElement('li');
      li.textContent = field;
      optionalList.appendChild(li);
    });
    optionalSection.appendChild(optionalList);
    fieldsDiv.appendChild(optionalSection);
  }
}

function createCustomFieldItem(fieldName = '', isMandatory = true) {
  const item = document.createElement('div');
  item.className = 'custom-value-item';
  item.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; background: var(--card-bg); border-radius: 8px';

  const typeIndicator = document.createElement('span');
  typeIndicator.textContent = isMandatory ? '**' : '#';
  typeIndicator.style.cssText = `font-weight: bold; font-size: 18px; color: ${isMandatory ? 'var(--primary)' : 'var(--secondary)'};`;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = fieldName;
  input.placeholder = isMandatory ? 'Mandatory field name' : 'Optional field name';
  input.style.cssText = 'flex: 1; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg); color: var(--text)';
  input.dataset.mandatory = isMandatory;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '🗑️';
  removeBtn.className = 'remove-btn';
  removeBtn.style.cssText = 'padding: 8px 12px; border-radius: 6px; cursor: pointer; background: var(--error-color); color: white; border: none';
  removeBtn.onclick = () => item.remove();

  item.appendChild(typeIndicator);
  item.appendChild(input);
  item.appendChild(removeBtn);

  return item;
}

function updateKeySectionVisibility() {
  if (apiSection.style.display === 'none') {
    openaiKeySection.classList.add('hidden');
    geminiKeySection.classList.add('hidden');
    return;
  }

  openaiKeySection.classList.remove('hidden');
  geminiKeySection.classList.remove('hidden');

  openaiKeySection.style.opacity = '1';
  openaiKeySection.style.borderColor = 'var(--border-color)';
  geminiKeySection.style.opacity = '1';
  geminiKeySection.style.borderColor = 'var(--border-color)';
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
      'selectedTemplate',
      'customTemplate',
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

      if (data.selectedTemplate) {
        selectedTemplate = data.selectedTemplate;
        templateDropdown.value = selectedTemplate;
      } else {
        selectedTemplate = 'default';
      }

      if (data.customTemplate) {
        customTemplate = data.customTemplate;
      } else {
        customTemplate = { mandatory: [], optional: [] };
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
      updateTemplatesButtonText();
      renderTemplatePreview(selectedTemplate);

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
    changeKeyBtn.innerHTML = '🔑 Change API Keys';

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

// Templates functionality
templatesBtn.addEventListener('click', () => {
  const isPanelOpen = templatesSection.style.display === 'block';

  if (!isPanelOpen) {
    templatesSection.style.display = 'block';
    generateSection.style.display = 'none';
    templatesBtn.innerHTML = '🔼 Close Templates';

    renderTemplatePreview(selectedTemplate);

    if (selectedTemplate === 'custom') {
      customTemplateEditor.style.display = 'block';
      customFieldsList.innerHTML = '';
      customTemplate.mandatory.forEach(field => {
        customFieldsList.appendChild(createCustomFieldItem(field, true));
      });
      customTemplate.optional.forEach(field => {
        customFieldsList.appendChild(createCustomFieldItem(field, false));
      });
    } else {
      customTemplateEditor.style.display = 'none';
    }
  } else {
    templatesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateTemplatesButtonText();
  }

  setStatus('');
});

templateDropdown.addEventListener('change', () => {
  const newTemplate = templateDropdown.value;
  selectedTemplate = newTemplate;

  renderTemplatePreview(selectedTemplate);

  if (selectedTemplate === 'custom') {
    customTemplateEditor.style.display = 'block';
    customFieldsList.innerHTML = '';
    customTemplate.mandatory.forEach(field => {
      customFieldsList.appendChild(createCustomFieldItem(field, true));
    });
    customTemplate.optional.forEach(field => {
      customFieldsList.appendChild(createCustomFieldItem(field, false));
    });
  } else {
    customTemplateEditor.style.display = 'none';
  }
});

addMandatoryFieldBtn.addEventListener('click', () => {
  const item = createCustomFieldItem('', true);
  customFieldsList.appendChild(item);
  item.querySelector('input').focus();
});

addOptionalFieldBtn.addEventListener('click', () => {
  const item = createCustomFieldItem('', false);
  customFieldsList.appendChild(item);
  item.querySelector('input').focus();
});

saveTemplateBtn.addEventListener('click', () => {
  if (selectedTemplate === 'custom') {
    const mandatory = [];
    const optional = [];
    const inputs = customFieldsList.querySelectorAll('input');

    inputs.forEach(input => {
      const fieldName = input.value.trim();
      if (fieldName) {
        if (input.dataset.mandatory === 'true') {
          mandatory.push(fieldName);
        } else {
          optional.push(fieldName);
        }
      }
    });

    if (mandatory.length === 0) {
      setStatus('At least one mandatory field is required', 'red');
      return;
    }

    customTemplate = { mandatory, optional };
  }

  chrome.storage.local.set({
    selectedTemplate: selectedTemplate,
    customTemplate: customTemplate
  }, () => {
    templatesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateTemplatesButtonText();
    setStatus('Template saved!', 'green');
    console.log('Template saved:', selectedTemplate, customTemplate);
  });
});

generateBtn.addEventListener('click', () => {
  console.log('Generate button clicked.');

  if (!validateCurrentKey()) {
    return;
  }

  if (isGenerating) {
    console.log('Generation already in progress, ignoring click.');
    return;
  }

  isGenerating = true;

  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Generating...';
  generateBtn.style.opacity = '0.6';
  generateBtn.style.cursor = 'not-allowed';

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setStatus('⏳ Sending request...');
    console.log(`Injecting content script into tab ${tab.id}.`);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['content.js'],
      },
      () => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => {
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

            // Get the active template
            const activeTemplate = selectedTemplate === 'custom' ? customTemplate : templates[selectedTemplate];

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (key, model, provider, template) => {
                console.log('Content script received:', {
                  key: key ? '***' + key.slice(-4) : 'empty',
                  model,
                  provider,
                  template,
                });
                window.dispatchEvent(
                  new CustomEvent('ai-pr-gen', {
                    detail: {
                      apiKey: key,
                      model: model,
                      provider: provider,
                      template: template,
                    },
                  })
                );
              },
              args: [
                getCurrentKey(),
                selectedModel,
                selectedProvider,
                activeTemplate,
              ],
            });

            statusTimeout = setTimeout(() => {
              console.warn('No response from content script. Reloading tab.');
              chrome.tabs.reload(tab.id);
              enableGenerateButton();
              isGenerating = false;
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
  isGenerating = false;
}
