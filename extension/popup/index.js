const groqInput     = document.getElementById('groq-key')
const claudeInput   = document.getElementById('claude-key')
const autoInsertBtn = document.getElementById('auto-insert-toggle')
const saveBtn       = document.getElementById('save-btn')
const savedMsg      = document.getElementById('saved-msg')

// Load saved settings
chrome.storage.sync.get(['groqKey', 'claudeKey', 'autoInsert'], (data) => {
  if (data.groqKey)   groqInput.value   = data.groqKey
  if (data.claudeKey) claudeInput.value = data.claudeKey
  const autoInsert = data.autoInsert ?? false
  autoInsertBtn.setAttribute('aria-checked', String(autoInsert))
})

autoInsertBtn.addEventListener('click', () => {
  const current = autoInsertBtn.getAttribute('aria-checked') === 'true'
  autoInsertBtn.setAttribute('aria-checked', String(!current))
})

saveBtn.addEventListener('click', () => {
  const autoInsert = autoInsertBtn.getAttribute('aria-checked') === 'true'
  chrome.storage.sync.set({
    groqKey:    groqInput.value.trim(),
    claudeKey:  claudeInput.value.trim(),
    autoInsert,
  }, () => {
    savedMsg.classList.remove('hidden')
    setTimeout(() => savedMsg.classList.add('hidden'), 2000)
  })
})
