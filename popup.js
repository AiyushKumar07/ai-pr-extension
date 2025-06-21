const statusEl = document.getElementById("status");
const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("modelSelect");
const generateBtn = document.getElementById("generateBtn");
const changeKeyBtn = document.getElementById("changeKeyBtn");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const apiSection = document.getElementById("apiSection");

let currentKey = "";

window.onload = async () => {
  chrome.storage.local.get(["openaiKey", "openaiModel"], (data) => {
    if (data.openaiKey) {
      currentKey = data.openaiKey;
      apiKeyInput.value = data.openaiKey;
    }
    if (data.openaiModel) modelSelect.value = data.openaiModel;
  });
};

// 🔘 Toggle API Key Edit Section
changeKeyBtn.addEventListener("click", () => {
  apiSection.style.display = apiSection.style.display === "none" ? "block" : "none";
  apiKeyInput.value = currentKey;
  setStatus(""); // clear
});

// 💾 Save New API Key
saveKeyBtn.addEventListener("click", () => {
  const newKey = apiKeyInput.value.trim();
  if (!newKey) return setStatus("Key cannot be empty", "red");

  chrome.storage.local.set({ openaiKey: newKey }, () => {
    currentKey = newKey;
    apiSection.style.display = "none";
    setStatus("API key saved!", "green");
  });
});

// 🧠 Trigger PR Generation
generateBtn.addEventListener("click", async () => {
  const model = modelSelect.value;
  if (!currentKey) return setStatus("Please set your API key first", "red");

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    setStatus("Sending request...");
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (key, model) => {
        window.dispatchEvent(new CustomEvent("ai-pr-gen", {
          detail: { apiKey: key, model }
        }));
      },
      args: [currentKey, model]
    });
  });
});

// 🎯 Listen for status updates from content.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ai-pr-gen-status") {
    setStatus(msg.message.text, msg.message.color);
  }
});

function setStatus(text, color = "black") {
  statusEl.textContent = text;
  statusEl.style.color = color;
}
