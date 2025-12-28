function waitForPRForm(timeout = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const prTitleInput = document.querySelector('#pull_request_title');
      const prDescInput = document.querySelector('#pull_request_body');
      if (prTitleInput && prDescInput) {
        clearInterval(interval);
        resolve({ prTitleInput, prDescInput });
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('PR form not found'));
      }
    }, 200);
  });
}

function simulateInput(el, value) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

async function makeOpenAIRequest(apiKey, model, prompt) {
  // Ensure the prompt is properly encoded
  const encodedPrompt = prompt.replace(/[^\x00-\x7F]/g, '');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: encodedPrompt }],
      temperature: 0.3,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `OpenAI API error: ${data.error?.message || res.statusText}`
    );
  }

  if (!data.choices || !data.choices[0]) {
    throw new Error('Empty or invalid response from OpenAI');
  }

  const content = data.choices[0].message.content || '';
  return content;
}

async function makeGeminiRequest(apiKey, model, prompt) {
  // Map Gemini model names to actual API model names
  const modelMap = {
    // Gemini 2.5 Series (Stable Models Only)
    'gemini-2.5-pro': 'gemini-2.5-pro',
    'gemini-2.5-flash': 'gemini-2.5-flash',

    // Gemini 2.0 Series (Stable Models Only)
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',

    // Gemini 1.5 Series (Stable Models Only)
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-flash-8b': 'gemini-1.5-flash-8b',
    'gemini-1.5-pro': 'gemini-1.5-pro',

    // Legacy models (keeping for backward compatibility)
    'gemini-1.5-flash-latest': 'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest': 'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
    'gemini-2.0-flash-latest-exp': 'gemini-2.0-flash-latest-exp',
  };

  const apiModel = modelMap[model] || model;
  const encodedPrompt = prompt.replace(/[^\x00-\x7F]/g, '');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`,
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
                text: encodedPrompt,
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Gemini API error: ${data.error?.message || res.statusText}`
    );
  }

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Empty or invalid response from Gemini');
  }

  const content = data.candidates[0].content.parts[0].text || '';
  return content;
}

window.addEventListener('ai-pr-gen', async e => {
  const { apiKey, model, provider, customValues } = e.detail;

  // Prevent multiple executions of the same request
  if (window.isProcessingPRRequest) {
    return;
  }

  // Set flag to prevent duplicate processing
  window.isProcessingPRRequest = true;

  try {
    const { prTitleInput, prDescInput } = await waitForPRForm();

    // Always parse commits for intent-aware generation
    postStatus('📝 Reading commits...', 'blue', 'info');
    const commits = parseCommits();

    let commitsContext = '';
    if (commits.length > 0) {
      commitsContext = '\n\nCommit History:\n';
      commits.forEach((commit, index) => {
        commitsContext += `\nCommit ${index + 1}:\n`;
        commitsContext += `Title: ${commit.title}\n`;
        if (commit.body) {
          commitsContext += `Message: ${commit.body}\n`;
        }
        if (commit.author) {
          commitsContext += `Author: ${commit.author}\n`;
        }
      });
    }

    postStatus('📖 Reading diff...', 'blue', 'info');
    const diff = parseDiff();

    let customValuesContext = '';
    if (customValues && customValues.length > 0) {
      customValues.forEach(({ key, value }) => {
        customValuesContext += `**${key}**: ${value}\n`;
      });
    }

    // Build enhanced prompt with commit context
    const promptIntro = commits.length > 0
      ? `Given the following GitHub PR with commit messages and code diff, generate a concise Pull Request title and a structured markdown description.

IMPORTANT: Use the commit messages to understand the INTENT and CONTEXT behind the changes. The commits reveal WHY these changes were made, not just WHAT changed. Summarize the overall purpose and goal of this PR based on the commit history and code changes.`
      : `Given the following GitHub PR diff, generate a concise Pull Request title and a structured markdown description.`;

    const prompt = `
${promptIntro}
${commitsContext}

Return only:
A PR title prefixed with conventional commit types (feat, fix, chore, refactor, etc.)
Two line breaks
Then the PR description using the following markdown structure:
**Purpose** : Briefly describe the PURPOSE and INTENT of the PR${commits.length > 0 ? ' (use commit messages to understand the why, not just what changed)' : ''}.
**Key Files Changed** : List the key files changed in the PR with what was changed.
**Summary of Changes** : Bullet point summary of changes (e.g., updated APIs, refactored services, added endpoints, etc.)
${customValuesContext}
**Notes** : Any additional notes or context that would be helpful for the reviewer.

Built-in Optional Sections:
**Approach** : Explain the approach, logic, or architectural decisions.
**Bug Fixes** : If the PR is a bug fix, list the issue fixes.
**Refactoring** : If the PR is a refactoring, list the structural/code improvements.
**Chores** : If the PR is a chore, list the tooling, dependency updates, or clean-up.
**Testing** : If the PR is a test, list the test cases added/updated.

Only return the title first, then two line breaks, then the markdown content.

PR Diff:
${diff}
`;

    try {
      const providerName = provider === 'openai' ? 'OpenAI' : 'Gemini';
      postStatus(`🤖 Sending to ${providerName}...`, 'blue', 'info');

      let content;
      if (provider === 'openai') {
        content = await makeOpenAIRequest(apiKey, model, prompt);
      } else if (provider === 'gemini') {
        content = await makeGeminiRequest(apiKey, model, prompt);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!content) {
        postStatus(`⚠️ Empty response from ${providerName}`, 'orange');
        window.isProcessingPRRequest = false;
        return;
      }

      const [title, ...bodyLines] = content.split('\n');
      const body = bodyLines.join('\n').trim();

      simulateInput(prTitleInput, title.trim());
      simulateInput(prDescInput, body);

      postStatus(
        `✅ PR details added via ${providerName}!`,
        'green',
        'success'
      );

      // Reset processing flag
      window.isProcessingPRRequest = false;
    } catch (err) {
      postStatus(
        `❌ ${provider === 'openai' ? 'OpenAI' : 'Gemini'} Error: ` +
        err.message,
        'red',
        'error'
      );

      // Reset processing flag
      window.isProcessingPRRequest = false;
    }
  } catch (err) {
    postStatus('🚫 ' + err.message, 'red', 'error');
    window.isProcessingPRRequest = false;
    return;
  }
});

function parseCommits() {
  try {
    const commits = [];
    const commitRows = document.querySelectorAll('.Box-row.js-commits-list-item');

    if (commitRows.length > 0) {
      commitRows.forEach((row, idx) => {
        const titleElement = row.querySelector('.Link--primary.text-bold.js-navigation-open');
        const bodyElement = row.querySelector('.Details-content--hidden pre');
        const authorElement = row.querySelector('.commit-author');

        const title = titleElement ? titleElement.textContent.trim() : '';
        const body = bodyElement ? bodyElement.textContent.trim() : '';
        const author = authorElement ? authorElement.textContent.trim() : '';

        if (title) {
          commits.push({
            title: title,
            body: body,
            author: author,
          });
        }
      });
    } else {
      const commitElements = document.querySelectorAll(
        '.commit-message, .commit-title, [data-testid="commit-row"]'
      );

      if (commitElements.length === 0) {
        const commitGroups = document.querySelectorAll('.TimelineItem-body');

        commitGroups.forEach((group, idx) => {
          const titleElement = group.querySelector('.commit-title, .message');
          const bodyElement = group.querySelector('.commit-desc, .commit-message');
          const authorElement = group.querySelector('.commit-author, [data-hovercard-type="user"]');

          if (titleElement) {
            const title = titleElement.textContent.trim();
            const body = bodyElement ? bodyElement.textContent.trim() : '';
            const author = authorElement ? authorElement.textContent.trim() : '';

            if (title) {
              commits.push({
                title: title,
                body: body,
                author: author,
              });
            }
          }
        });
      } else {
        commitElements.forEach((element, idx) => {
          const titleElement =
            element.querySelector('.commit-title') ||
            element.querySelector('[data-testid="commit-title"]') ||
            element;
          const bodyElement =
            element.querySelector('.commit-desc') ||
            element.querySelector('[data-testid="commit-message"]');
          const authorElement =
            element.querySelector('.commit-author') ||
            element.querySelector('[data-hovercard-type="user"]');

          const title = titleElement ? titleElement.textContent.trim() : '';
          const body = bodyElement ? bodyElement.textContent.trim() : '';
          const author = authorElement ? authorElement.textContent.trim() : '';

          if (title) {
            commits.push({
              title: title,
              body: body,
              author: author,
            });
          }
        });
      }
    }

    return commits;
  } catch (error) {
    return [];
  }
}

function parseDiff() {
  const IGNORED_EXTENSIONS = [
    // Images
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.bmp',
    '.svg',
    '.ico',
    '.webp',
    // Fonts
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
    // Videos
    '.mp4',
    '.mov',
    '.avi',
    '.wmv',
    // Audio
    '.mp3',
    '.wav',
    '.ogg',
    // Archives
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    // Other binary formats
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
  ];

  const files = [...document.querySelectorAll('.file-header')];

  const diffData = files
    .map((file, idx) => {
      const filename = file.querySelector('.file-info a')?.title.trim();

      if (!filename) {
        return null;
      }

      const fileExtension = filename.slice(filename.lastIndexOf('.'));
      if (IGNORED_EXTENSIONS.includes(fileExtension)) {
        return null;
      }

      const diffContentElement =
        file.nextElementSibling.querySelector('.js-diff-table');
      if (!diffContentElement) {
        return null;
      }

      const diffContent = diffContentElement.innerText;
      return `File: ${filename}\n${diffContent}`;
    })
    .filter(Boolean)
    .join('\n\n');

  return diffData;
}

function postStatus(text, color = 'white', type = 'info') {
  try {
    chrome.runtime.sendMessage(
      {
        type: 'ai-pr-gen-status',
        message: { text, color, type },
      },
      () => {
        const err = chrome.runtime.lastError?.message;
        if (err && !err.includes('The message port closed')) {
          console.warn('Could not send status message:', err);
        }
      }
    );
  } catch (error) {
    console.warn(
      `Could not send status to popup, it was likely closed: ${error}`
    );
  }
}
