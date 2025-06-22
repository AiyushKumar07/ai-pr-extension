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
  chrome.storage.local.get(['openaiKey', 'openaiModel', 'theme'], data => {
    if (data.openaiKey) {
      currentKey = data.openaiKey;
      apiKeyInput.value = '********';
    }
    if (data.openaiModel) {
      selectedModel = data.openaiModel;
    } else {
      selectedModel = 'gpt-4o-mini'; 
    }
    updateSelectedModelUI(selectedModel);

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
  apiSection.style.display = isPanelOpen ? 'none' : 'block';
  changeKeyBtn.innerHTML = isPanelOpen
    ? '🔑 Change API Key'
    : '🔼 Close Key Panel';
  generateBtn.style.display = isPanelOpen ? 'block' : 'none';
  if (isPanelOpen) apiKeyInput.value = '********';
  setStatus('');
});

eyeBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  if(apiKeyInput.type === 'text') {
    apiKeyInput.value = currentKey;
  }
  eyeBtn.textContent = isPassword ? '🙈' : '👁️';
});

saveKeyBtn.addEventListener('click', () => {
  const newKey = apiKeyInput.value.trim();
  if (!newKey || newKey === '********') return setStatus('Key cannot be empty', 'red');

  chrome.storage.local.set({ openaiKey: newKey }, () => {
    currentKey = newKey;
    apiSection.style.display = 'none';
    generateBtn.style.display = 'block';
    changeKeyBtn.innerHTML = '🔑 Change API Key';
    apiKeyInput.value = '********';
    setStatus('API key saved!', 'green');
  });
});

generateBtn.addEventListener('click', () => {
  if (!currentKey) return setStatus('Set your API key first', 'red');

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setStatus('⏳ Sending request...');
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
    setStatus(msg.message.text, msg.message.color);
  }
});

function setStatus(text, color) {
  statusEl.textContent = text;
  statusEl.style.color = color || 'var(--text)';
}
