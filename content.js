window.addEventListener('ai-pr-gen', async e => {
  const { apiKey, model } = e.detail;

  const prTitleInput = document.querySelector('#pull_request_title');
  const prDescInput = document.querySelector('#pull_request_body');

  if (!prTitleInput || !prDescInput) {
    postStatus('PR form not found', 'red');
    return;
  }

  postStatus('Reading diff...');

  const getDiff = () => {
    const files = [...document.querySelectorAll('.file')];
    return files
      .map(file => {
        const filename = file.querySelector('.file-info a')?.textContent.trim();
        const lines = [...file.querySelectorAll('.blob-code')];
        const code = lines.map(l => l.textContent).join('\n');
        return `File: ${filename}\n${code}`;
      })
      .join('\n\n');
  };

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
${getDiff()}
`;

  try {
    postStatus('Sending to OpenAI...');

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

    if (!data.choices || !data.choices[0]) {
      postStatus('Empty response from OpenAI', 'orange');
      return;
    }

    const content = data.choices[0].message.content || '';
    const [title, ...bodyLines] = content.split('\n');
    prTitleInput.value = title.trim();
    prDescInput.value = bodyLines.join('\n').trim();
    postStatus('PR details added!', 'green');
  } catch (err) {
    postStatus('Error: ' + err.message, 'red');
    console.error('OpenAI error:', err);
  }
});

function postStatus(text, color = 'black') {
  chrome.runtime.sendMessage({
    type: 'ai-pr-gen-status',
    message: { text, color },
  });
}
