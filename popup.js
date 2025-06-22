const apiKeyInput = document.getElementById('apiKey');
const changeKeyBtn = document.getElementById('changeKeyBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiSection = document.getElementById('apiSection');
const eyeBtn = document.getElementById('eyeBtn');
const generateBtn = document.getElementById('generateBtn');
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const modelDropdownBtn = document.getElementById('modelDropdownBtn');
const modelList = document.getElementById('modelList');
const dropdown = document.querySelector('.dropdown');

let currentKey = '';
let selectedModel = 'gpt-4o-mini';
let showKey = false;
let tempKeyInput = '';

function getMaskedKey(key) {
  return '•'.repeat(key.length); // Or use '*' if preferred
}

function updateSelectedModelUI(model) {
  modelDropdownBtn.textContent = model;
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.value === model) {
      opt.classList.add('selected');
    }
  });
}

modelDropdownBtn.addEventListener('click', () => {
  dropdown.classList.toggle('open');
});

modelList.addEventListener('click', e => {
  if (e.target.classList.contains('option')) {
    selectedModel = e.target.dataset.value;
    updateSelectedModelUI(selectedModel);
    dropdown.classList.remove('open');
    chrome.storage.local.set({ openaiModel: selectedModel });
  }
});

window.onload = () => {
  console.log('Popup loaded.');
  chrome.storage.local.get(['openaiKey', 'openaiModel', 'theme'], data => {
    if (data.openaiKey) {
      currentKey = data.openaiKey;
      apiKeyInput.value = getMaskedKey(currentKey);
    }
    console.log('Stored data loaded:', data);
    if (data.openaiModel) {
      selectedModel = data.openaiModel;
    } else {
      selectedModel = 'gpt-4o-mini';
    }
    updateSelectedModelUI(selectedModel);
    console.log('Selected model set to:', selectedModel);

    if (data.theme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.innerHTML = '☀️ Enable Light Mode';
    } else {
      themeToggle.innerHTML = '🌙 Enable Dark Mode';
    }
  });
};

changeKeyBtn.addEventListener('click', () => {
  const isPanelOpen = apiSection.style.display === 'block';

  if (!isPanelOpen) {
    apiSection.style.display = 'block';
    generateBtn.style.display = 'none';
    changeKeyBtn.innerHTML = '🔼 Close Key Panel';
    apiKeyInput.type = showKey ? 'text' : 'password';
    apiKeyInput.value = showKey
      ? tempKeyInput || currentKey
      : getMaskedKey(tempKeyInput || currentKey);
  } else {
    apiSection.style.display = 'none';
    generateBtn.style.display = 'block';
    changeKeyBtn.innerHTML = '🔑 Change API Key';
  }

  setStatus('');
});

eyeBtn.addEventListener('click', () => {
  showKey = !showKey;
  apiKeyInput.type = showKey ? 'text' : 'password';
  apiKeyInput.value = showKey ? currentKey : getMaskedKey(currentKey);
  eyeBtn.textContent = showKey ? '🙈' : '👁️';
});

apiKeyInput.addEventListener('input', () => {
  tempKeyInput = apiKeyInput.value;
});

saveKeyBtn.addEventListener('click', () => {
  const newKey = apiKeyInput.value.trim();
  if (!newKey || newKey === getMaskedKey(currentKey)) {
    return setStatus('Key cannot be empty or unchanged', 'red');
  }

  chrome.storage.local.set({ openaiKey: newKey }, () => {
    currentKey = newKey;
    tempKeyInput = '';
    apiSection.style.display = 'none';
    generateBtn.style.display = 'block';
    changeKeyBtn.innerHTML = '🔑 Change API Key';
    apiKeyInput.value = getMaskedKey(currentKey);
    showKey = false;
    setStatus('API key saved!', 'green');
    console.log('API key saved.');
  });
});

generateBtn.addEventListener('click', () => {
  console.log('Generate button clicked.');
  if (!currentKey) {
    console.error('API key not set.');
    return setStatus('Set your API key first', 'red');
  }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setStatus('⏳ Sending request...');
    console.log(`Injecting content script into tab ${tab.id}.`);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (key, model) => {
        window.dispatchEvent(
          new CustomEvent('ai-pr-gen', {
            detail: { apiKey: key, model: model },
          })
        );
      },
      args: [currentKey, selectedModel],
    });
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
    console.log('Status message received from content script:', msg.message);
    setStatus(msg.message.text, msg.message.color);
  }
});

function setStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || 'var(--text)';
}
