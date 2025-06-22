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

window.addEventListener('ai-pr-gen', async e => {
  console.log('Event "ai-pr-gen" received in content script.');
  const { apiKey, model } = e.detail;

  try {
    const { prTitleInput, prDescInput } = await waitForPRForm();
    postStatus('Reading diff...');
    const diff = parseDiff();

    console.log('Extracted Diff:', diff);

    const prompt = `
Given the following GitHub PR diff, generate a concise Pull Request title and a structured markdown description using the format below.
Return only:
A PR title prefixed with conventional commit types (feat, fix, chore, refactor, etc.)
Two line breaks
Then the PR description using the following markdown structure:
**_What Changed_** : Bullet point summary of changes (e.g., updated APIs, refactored services, added endpoints, etc.)
**_Why_** : Reason for the change (e.g., bug fix, performance improvement, feature request, tech debt, etc.)
**_Additional Notes_** : Any additional notes or context that would be helpful for the reviewer.


Only return the title first, then two line breaks, then the markdown content.

PR Diff:
${diff}
`;
    console.log('Generated Prompt:', prompt);

    try {
      postStatus('Sending to OpenAI...');
      console.log('Sending request to OpenAI API...');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      console.log('Received response from OpenAI:', data);

      if (!data.choices || !data.choices[0]) {
        postStatus('Empty response from OpenAI', 'orange');
        console.error('Empty or invalid response from OpenAI:', data);
        return;
      }

      const content = data.choices[0].message.content || '';
      const [title, ...bodyLines] = content.split('\n');
      prTitleInput.value = title.trim();
      prDescInput.value = bodyLines.join('\n').trim();
      postStatus('PR details added!', 'green');
      console.log('Successfully populated PR title and description.');
    } catch (err) {
      postStatus('Error: ' + err.message, 'red');
      console.error('OpenAI error:', err);
    }
  } catch (err) {
    postStatus(err.message, 'red');
    return;
  }
});

function parseDiff() {
  console.log('Parsing diff from the page...');

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
    .map(file => {
      const filename = file.querySelector('.file-info a')?.title.trim();

      if (!filename) {
        console.warn('Skipping a file element without a filename.');
        return null;
      }

      const fileExtension = filename.slice(filename.lastIndexOf('.'));
      if (IGNORED_EXTENSIONS.includes(fileExtension)) {
        console.log(`Skipping binary or non-code file: ${filename}`);
        return null;
      }

      const diffContentElement =
        file.nextElementSibling.querySelector('.js-diff-table');
      if (!diffContentElement) {
        console.warn(`Could not find diff content for file: ${filename}`);
        return null;
      }

      const diffContent = diffContentElement.innerText;
      return `File: ${filename}\n${diffContent}`;
    })
    .filter(Boolean)
    .join('\n\n');

  console.log('Finished parsing diff.');
  return diffData;
}

function postStatus(text, color = 'black') {
  try {
    chrome.runtime.sendMessage(
      {
        type: 'ai-pr-gen-status',
        message: { text, color },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn(
            'Could not send status message:',
            chrome.runtime.lastError.message
          );
        }
      }
    );
  } catch (error) {
    console.warn(
      `Could not send status to popup, it was likely closed: ${error}`
    );
  }
}
