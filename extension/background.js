chrome.commands.onCommand.addListener((command) => {
  const typeMap = {
    'toggle-voiceink':  'TOGGLE_VOICEINK',
    'toggle-recording': 'TOGGLE_RECORDING',
  }
  const type = typeMap[command]
  if (!type) return
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type }, () => {
        void chrome.runtime.lastError
      })
    }
  })
})

// ---- API呼び出しはbackground側で行う ----
// content script内のfetchはページのCSP（connect-src等）に阻まれることがあるため、
// service workerはページの制約を受けないここで実行する。
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'TRANSCRIBE') {
    transcribeAudio(msg).then(sendResponse)
    return true
  }
  if (msg.type === 'REFINE') {
    refineText(msg).then(sendResponse)
    return true
  }
})

async function transcribeAudio({ buffer, mimeType, groqKey }) {
  try {
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType })
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
    const form = new FormData()
    form.append('file', blob, `rec.${ext}`)
    form.append('model', 'whisper-large-v3')
    form.append('language', 'ja')
    form.append('response_format', 'json')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    return { text: data.text?.trim() ?? '' }
  } catch (e) {
    return { error: e.message }
  }
}

async function refineText({ text, systemPrompt, thinkingMode, claudeKey }) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: thinkingMode ? 10000 : 2048,
        ...(thinkingMode ? { thinking: { type: 'enabled', budget_tokens: 8000 } } : {}),
        system: systemPrompt,
        messages: [{ role: 'user', content: `<voice_transcript>\n${text}\n</voice_transcript>` }],
      }),
    })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(`Claude ${res.status}: ${msg}`)
    }
    const data = await res.json()
    const textBlock = data.content?.find(b => b.type === 'text')
    const refined = textBlock?.text?.trim() ?? data.content?.[0]?.text?.trim() ?? ''
    return { refined }
  } catch (e) {
    return { error: e.message }
  }
}
