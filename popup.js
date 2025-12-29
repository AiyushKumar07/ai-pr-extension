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
const customTemplatesSection = document.getElementById('customTemplatesSection');
const customTemplateCreator = document.getElementById('customTemplateCreator');
const createTemplateBtn = document.getElementById('createTemplateBtn');
const templateNameInput = document.getElementById('templateNameInput');
const templateFieldsInput = document.getElementById('templateFieldsInput');
const saveNewTemplateBtn = document.getElementById('saveNewTemplateBtn');
const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
const customTemplatesContainer = document.getElementById('customTemplatesContainer');
const creatorTitle = document.getElementById('creatorTitle');
const backToSelectionBtn = document.getElementById('backToSelectionBtn');
const saveTemplateSelectionBtn = document.getElementById('saveTemplateSelectionBtn');
const nameCharCount = document.getElementById('nameCharCount');

let openaiKey = '';
let geminiKey = '';
let selectedModel = 'gpt-4o-mini';
let selectedProvider = 'openai';
let showOpenaiKey = false;
let showGeminiKey = false;
let tempOpenaiKey = '';
let tempGeminiKey = '';
let selectedTemplate = 'default';
let tempSelectedTemplate = 'default'; // Temporary selection before saving
let customTemplates = {}; // { templateId: { name, mandatory: [], optional: [] } }
let editingTemplateId = null;
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
  // Don't update button text if the panel is currently open
  if (templatesSection.style.display === 'block') {
    return;
  }

  let templateName;
  if (templates[selectedTemplate]) {
    templateName = templates[selectedTemplate].name;
  } else if (customTemplates[selectedTemplate]) {
    templateName = customTemplates[selectedTemplate].name;
  } else {
    templateName = 'Default';
  }
  templatesBtn.innerHTML = `📋 Template: ${templateName}`;
}

function getActiveTemplate() {
  return templates[selectedTemplate] || customTemplates[selectedTemplate] || templates.default;
}

function renderTemplatePreview(templateId) {
  const template = templates[templateId] || customTemplates[templateId];
  if (!template) return;

  const fieldsDiv = templatePreview.querySelector('.template-fields');
  fieldsDiv.innerHTML = '';

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

function parseTemplateFields(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const mandatory = [];
  const optional = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('**')) {
      const fieldName = trimmed.substring(2).trim();
      if (fieldName) mandatory.push(fieldName);
    } else if (trimmed.startsWith('#')) {
      const fieldName = trimmed.substring(1).trim();
      if (fieldName) optional.push(fieldName);
    }
  });

  return { mandatory, optional };
}

function renderCustomTemplatesList() {
  customTemplatesContainer.innerHTML = '';

  const customIds = Object.keys(customTemplates);
  if (customIds.length === 0) {
    customTemplatesContainer.innerHTML = '<p style="opacity: 0.6; font-size: 13px; text-align: center; padding: 20px">No custom templates yet. Create one to get started!</p>';
    return;
  }

  customIds.forEach(templateId => {
    const template = customTemplates[templateId];
    const item = document.createElement('div');
    const isActive = selectedTemplate === templateId;

    // Main card container with vertical layout
    item.style.cssText = `
      display: flex; 
      flex-direction: column;
      gap: 12px; 
      padding: 16px; 
      background: var(--bg); 
      border-radius: 8px; 
      border: 2px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}; 
      cursor: pointer; 
      transition: all 0.2s;
    `;

    // Make the whole card clickable to select the template
    item.onclick = (e) => {
      // Don't select if clicking edit or delete buttons
      if (e.target.tagName === 'BUTTON') return;
      selectCustomTemplate(templateId);
    };

    item.onmouseenter = () => {
      if (!isActive) {
        item.style.borderColor = 'var(--primary)';
        item.style.opacity = '0.8';
      }
    };

    item.onmouseleave = () => {
      if (!isActive) {
        item.style.borderColor = 'var(--border-color)';
        item.style.opacity = '1';
      }
    };

    // Top row: Name + Active label
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; align-items: center; gap: 10px; justify-content: space-between;';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = template.name;
    nameSpan.style.cssText = `
      font-weight: 600; 
      font-size: 15px;
      word-wrap: break-word; 
      word-break: break-word; 
      overflow-wrap: break-word; 
      flex: 1;
      ${isActive ? 'color: var(--primary)' : ''}
    `;

    topRow.appendChild(nameSpan);

    if (isActive) {
      const activeLabel = document.createElement('span');
      activeLabel.textContent = '✓ Active';
      activeLabel.style.cssText = `
        font-size: 11px; 
        color: white;
        background: var(--primary);
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 600; 
        white-space: nowrap;
      `;
      topRow.appendChild(activeLabel);
    }

    // Bottom row: Edit and Delete buttons
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 8px;';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.style.cssText = `
      flex: 1;
      padding: 8px 12px; 
      border-radius: 6px; 
      cursor: pointer; 
      background: var(--primary); 
      color: white; 
      border: none; 
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    `;
    editBtn.onclick = (e) => {
      e.stopPropagation();
      editTemplate(templateId);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.style.cssText = `
      flex: 1;
      padding: 8px 12px; 
      border-radius: 6px; 
      cursor: pointer; 
      background: var(--error-color); 
      color: white; 
      border: none; 
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    `;
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTemplate(templateId);
    };

    buttonRow.appendChild(editBtn);
    buttonRow.appendChild(deleteBtn);

    // Assemble the card
    item.appendChild(topRow);
    item.appendChild(buttonRow);
    customTemplatesContainer.appendChild(item);
  });
}

function selectCustomTemplate(templateId) {
  // Update temporary selection (don't save yet)
  tempSelectedTemplate = templateId;
  selectedTemplate = templateId;

  chrome.storage.local.set({ selectedTemplate: selectedTemplate }, () => {
    // Switch back to main template view
    customTemplatesSection.style.display = 'none';
    templatePreview.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'block';

    renderCustomTemplatesList();
    populateTemplateDropdown();
    renderTemplatePreview(templateId);
    setStatus(`Template "${customTemplates[templateId].name}" selected! Click "Save & Close" to apply.`, '#1a73e8');
  });
}

function populateTemplateDropdown() {
  // Clear all options
  templateDropdown.innerHTML = '';

  // Add built-in templates
  const defaultOption = document.createElement('option');
  defaultOption.value = 'default';
  defaultOption.textContent = '🎯 Default (Comprehensive)';
  templateDropdown.appendChild(defaultOption);

  const minimalOption = document.createElement('option');
  minimalOption.value = 'minimal';
  minimalOption.textContent = '⚡ Minimal (Quick)';
  templateDropdown.appendChild(minimalOption);

  // Add custom templates if any exist
  const customIds = Object.keys(customTemplates);
  if (customIds.length > 0) {
    const separator1 = document.createElement('option');
    separator1.disabled = true;
    separator1.textContent = '── Custom Templates ──';
    templateDropdown.appendChild(separator1);

    customIds.forEach(templateId => {
      const option = document.createElement('option');
      option.value = templateId;
      option.textContent = `✏️ ${customTemplates[templateId].name}`;
      templateDropdown.appendChild(option);
    });
  }

  // Add separator and manage option
  const separator2 = document.createElement('option');
  separator2.disabled = true;
  separator2.textContent = '──────────────';
  templateDropdown.appendChild(separator2);

  const manageOption = document.createElement('option');
  manageOption.value = '__custom_section__';
  manageOption.textContent = '✏️ Manage Custom Templates...';
  templateDropdown.appendChild(manageOption);

  // Set current selection (use tempSelectedTemplate when panel is open, otherwise use selectedTemplate)
  const currentSelection = templatesSection.style.display === 'block' ? tempSelectedTemplate : selectedTemplate;
  if (templates[currentSelection] || customTemplates[currentSelection]) {
    templateDropdown.value = currentSelection;
  } else {
    templateDropdown.value = 'default';
  }
}

function editTemplate(templateId) {
  editingTemplateId = templateId;
  const template = customTemplates[templateId];

  creatorTitle.textContent = 'Edit Template';
  templateNameInput.value = template.name;

  // Update character counter
  const length = template.name.length;
  nameCharCount.textContent = `(${length}/30)`;
  if (length > 30) {
    nameCharCount.style.color = 'var(--error-color)';
  } else if (length < 3) {
    nameCharCount.style.color = '#ff9800';
  } else {
    nameCharCount.style.color = 'var(--primary)';
  }

  // Convert template fields back to text format
  const fieldsText = [
    ...template.mandatory.map(f => `**${f}`),
    ...template.optional.map(f => `#${f}`)
  ].join('\n');

  templateFieldsInput.value = fieldsText;

  customTemplatesSection.style.display = 'none';
  customTemplateCreator.style.display = 'block';
}

function deleteTemplate(templateId) {
  if (confirm(`Delete template "${customTemplates[templateId].name}"?`)) {
    delete customTemplates[templateId];

    // If deleted template was selected, switch to default
    if (selectedTemplate === templateId) {
      selectedTemplate = 'default';
      chrome.storage.local.set({ selectedTemplate: 'default' });
    }

    chrome.storage.local.set({ customTemplates: customTemplates }, () => {
      renderCustomTemplatesList();
      populateTemplateDropdown();
      updateTemplatesButtonText();
      renderTemplatePreview(selectedTemplate);
      setStatus('Template deleted!', 'green');
    });
  }
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

// Character counter for template name
templateNameInput.addEventListener('input', () => {
  const length = templateNameInput.value.length;
  nameCharCount.textContent = `(${length}/30)`;

  if (length > 30) {
    nameCharCount.style.color = 'var(--error-color)';
  } else if (length < 3) {
    nameCharCount.style.color = '#ff9800'; // Orange for warning
  } else {
    nameCharCount.style.color = 'var(--primary)';
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
      'customTemplates',
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
      } else {
        selectedTemplate = 'default';
      }

      if (data.customTemplates) {
        customTemplates = data.customTemplates;
      } else {
        customTemplates = {};
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
      populateTemplateDropdown();
      updateTemplatesButtonText();
      renderTemplatePreview(selectedTemplate);
      renderCustomTemplatesList();

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

    // Reset to show template selection view
    customTemplatesSection.style.display = 'none';
    customTemplateCreator.style.display = 'none';
    templatePreview.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'block';

    // Initialize temporary selection with current selection
    tempSelectedTemplate = selectedTemplate;

    renderTemplatePreview(selectedTemplate);
    renderCustomTemplatesList();
    populateTemplateDropdown();
  } else {
    templatesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateTemplatesButtonText();

    // Reset all views
    customTemplatesSection.style.display = 'none';
    customTemplateCreator.style.display = 'none';
    templatePreview.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'block';

    // Reset temp selection to actual selection
    tempSelectedTemplate = selectedTemplate;
  }

  setStatus('');
});

// Template dropdown change - just update preview, don't save yet
templateDropdown.addEventListener('change', () => {
  const selectedValue = templateDropdown.value;

  if (selectedValue === '__custom_section__') {
    // User clicked "Manage Custom Templates..." - show the custom section
    templatePreview.style.display = 'none';
    customTemplatesSection.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'none';
    renderCustomTemplatesList();
    return;
  }

  // Update temporary selection and preview (don't save yet)
  tempSelectedTemplate = selectedValue;
  renderTemplatePreview(tempSelectedTemplate);
  setStatus('Preview updated. Click "Save & Close" to apply.', '#1a73e8');
  console.log('Template preview:', tempSelectedTemplate);
});

// Save template selection button
saveTemplateSelectionBtn.addEventListener('click', () => {
  // Save the temporary selection as the actual selection
  selectedTemplate = tempSelectedTemplate;

  chrome.storage.local.set({ selectedTemplate: selectedTemplate }, () => {
    // Close the panel
    templatesSection.style.display = 'none';
    generateSection.style.display = 'block';
    updateTemplatesButtonText();

    // Reset views
    customTemplatesSection.style.display = 'none';
    customTemplateCreator.style.display = 'none';
    templatePreview.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'block';

    setStatus('Template saved!', 'green');
    console.log('Template saved:', selectedTemplate);
  });
});

backToSelectionBtn.addEventListener('click', () => {
  customTemplatesSection.style.display = 'none';
  customTemplateCreator.style.display = 'none';
  createTemplateBtn.style.display = 'block';
  templatePreview.style.display = 'block';
  saveTemplateSelectionBtn.style.display = 'block';

  // Reset to current saved selection
  tempSelectedTemplate = selectedTemplate;
  populateTemplateDropdown();
  renderTemplatePreview(selectedTemplate);
  setStatus('');
});

createTemplateBtn.addEventListener('click', () => {
  editingTemplateId = null;
  creatorTitle.textContent = 'Create New Template';
  templateNameInput.value = '';
  templateFieldsInput.value = '';

  // Reset character counter
  nameCharCount.textContent = '(0/30)';
  nameCharCount.style.color = '#ff9800'; // Orange for warning (needs at least 3 chars)

  customTemplatesSection.style.display = 'none';
  customTemplateCreator.style.display = 'block';
});

cancelTemplateBtn.addEventListener('click', () => {
  customTemplateCreator.style.display = 'none';
  customTemplatesSection.style.display = 'block';
  editingTemplateId = null;
  setStatus('');
});

saveNewTemplateBtn.addEventListener('click', () => {
  const name = templateNameInput.value.trim();
  const fieldsText = templateFieldsInput.value;

  if (!name) {
    setStatus('Template name is required', 'red');
    return;
  }

  if (name.length > 30) {
    setStatus('Template name must be 30 characters or less', 'red');
    return;
  }

  if (name.length < 3) {
    setStatus('Template name must be at least 3 characters', 'red');
    return;
  }

  const { mandatory, optional } = parseTemplateFields(fieldsText);

  if (mandatory.length === 0 && optional.length === 0) {
    setStatus('At least one field is required', 'red');
    return;
  }

  // Generate template ID
  const templateId = editingTemplateId || `custom_${Date.now()}`;

  customTemplates[templateId] = {
    name: name,
    mandatory: mandatory,
    optional: optional
  };

  // Auto-select the newly created/edited template
  selectedTemplate = templateId;
  tempSelectedTemplate = templateId;

  chrome.storage.local.set({
    customTemplates: customTemplates,
    selectedTemplate: selectedTemplate
  }, () => {
    customTemplateCreator.style.display = 'none';

    // Show template selection view with new template selected
    templatePreview.style.display = 'block';
    saveTemplateSelectionBtn.style.display = 'block';
    customTemplatesSection.style.display = 'none';

    renderCustomTemplatesList();
    populateTemplateDropdown(); // This will now include the new template
    renderTemplatePreview(selectedTemplate);
    updateTemplatesButtonText();

    const action = editingTemplateId ? 'updated' : 'created';
    setStatus(`Template ${action}! Click "Save & Close" to apply.`, '#1a73e8');
    console.log(`Template ${action}:`, templateId, customTemplates[templateId]);

    editingTemplateId = null;
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
            const activeTemplate = getActiveTemplate();

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
