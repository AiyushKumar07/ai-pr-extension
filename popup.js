const openaiKeyInput = document.getElementById('openaiKey');
const geminiKeyInput = document.getElementById('geminiKey');
const changeKeyBtn = document.getElementById('changeKeyBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiSection = document.getElementById('apiSection');
const openaiEyeBtn = document.getElementById('openaiEyeBtn');
const geminiEyeBtn = document.getElementById('geminiEyeBtn');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const modelDropdownBtn = document.getElementById('modelDropdownBtn');
const modelList = document.getElementById('modelList');
const dropdown = document.querySelector('.dropdown');
const openaiKeySection = document.getElementById('openaiKeySection');
const geminiKeySection = document.getElementById('geminiKeySection');

let openaiKey = '';
let geminiKey = '';
let selectedModel = 'gpt-4o-mini';
let selectedProvider = 'openai';
let showOpenaiKey = false;
let showGeminiKey = false;
let tempOpenaiKey = '';
let tempGeminiKey = '';

function getMaskedKey(key) {
  return '•'.repeat(key.length);
}

function updateSelectedModelUI(model, provider) {
  modelDropdownBtn.textContent = model;
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.value === model && opt.dataset.provider === provider) {
      opt.classList.add('selected');
    }
  });
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
    ['openaiKey', 'geminiKey', 'selectedModel', 'selectedProvider', 'theme'],
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
    generateBtn.style.display = 'none';
    changeKeyBtn.innerHTML = '🔼 Close Key Panel';
    updateKeySectionVisibility();

    // Show actual values when panel opens, not masked values
    openaiKeyInput.type = 'password';
    openaiKeyInput.value = tempOpenaiKey || openaiKey || '';

    geminiKeyInput.type = 'password';
    geminiKeyInput.value = tempGeminiKey || geminiKey || '';
  } else {
    apiSection.style.display = 'none';
    generateBtn.style.display = 'block';
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
  openaiEyeBtn.textContent = showOpenaiKey ? '🙈' : '👁️';
});

geminiEyeBtn.addEventListener('click', () => {
  showGeminiKey = !showGeminiKey;
  geminiKeyInput.type = showGeminiKey ? 'text' : 'password';
  geminiKeyInput.value = showGeminiKey
    ? tempGeminiKey || geminiKey || ''
    : tempGeminiKey || (geminiKey ? getMaskedKey(geminiKey) : '');
  geminiEyeBtn.textContent = showGeminiKey ? '🙈' : '👁️';
});

openaiKeyInput.addEventListener('input', () => {
  tempOpenaiKey = openaiKeyInput.value;
});

geminiKeyInput.addEventListener('input', () => {
  tempGeminiKey = geminiKeyInput.value;
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
    generateBtn.style.display = 'block';
    changeKeyBtn.innerHTML = '🔑 Change API Keys';

    openaiKeyInput.value = openaiKey ? getMaskedKey(openaiKey) : '';
    geminiKeyInput.value = geminiKey ? getMaskedKey(geminiKey) : '';
    showOpenaiKey = false;
    showGeminiKey = false;
    openaiEyeBtn.textContent = '👁️';
    geminiEyeBtn.textContent = '👁️';

    setStatus('API keys saved!', 'green');
    console.log('API keys saved.');
  });
});

generateBtn.addEventListener('click', () => {
  console.log('Generate button clicked.');

  if (!validateCurrentKey()) {
    return;
  }

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
        // Dispatch custom event once content script is loaded
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (key, model, provider) => {
            window.dispatchEvent(
              new CustomEvent('ai-pr-gen', {
                detail: { apiKey: key, model: model, provider: provider },
              })
            );
          },
          args: [getCurrentKey(), selectedModel, selectedProvider],
        });

        // Start 10s timeout to auto-reload if stuck
        statusTimeout = setTimeout(() => {
          console.warn('No response from content script. Reloading tab.');
          chrome.tabs.reload(tab.id);
        }, 10000);
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
  }
});

function setStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || 'var(--text)';
}
