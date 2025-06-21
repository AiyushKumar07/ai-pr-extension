chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Relay content.js → popup.js
    if (msg.type === "ai-pr-gen-status") {
      chrome.runtime.sendMessage(msg);
    }
  });
  