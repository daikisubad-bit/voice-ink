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

// ---- 辞書 ----
const dictList   = document.getElementById('dict-list')
const dictFrom   = document.getElementById('dict-from')
const dictTo     = document.getElementById('dict-to')
const dictAddBtn = document.getElementById('dict-add-btn')

let dictEntries = []

function saveDictEntries() {
  chrome.storage.sync.set({ dictEntries })
}

function renderDict() {
  dictList.innerHTML = ''
  if (dictEntries.length === 0) {
    dictList.innerHTML = '<p class="dict-empty">登録された単語はありません</p>'
    return
  }
  dictEntries.forEach((entry, i) => {
    const row = document.createElement('div')
    row.className = 'dict-row'
    row.innerHTML = `
      <span class="dict-from">${escHtml(entry.from)}</span>
      <span class="dict-arr">→</span>
      <span class="dict-to">${escHtml(entry.to)}</span>
      <button class="dict-del-btn" data-i="${i}">×</button>
    `
    row.querySelector('.dict-del-btn').addEventListener('click', () => {
      dictEntries.splice(i, 1)
      saveDictEntries()
      renderDict()
    })
    dictList.appendChild(row)
  })
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

chrome.storage.sync.get({ dictEntries: [] }, (data) => {
  dictEntries = data.dictEntries
  renderDict()
})

dictAddBtn.addEventListener('click', addEntry)
dictFrom.addEventListener('keydown', (e) => { if (e.key === 'Enter') dictTo.focus() })
dictTo.addEventListener('keydown', (e) => { if (e.key === 'Enter') addEntry() })

function addEntry() {
  const from = dictFrom.value.trim()
  const to   = dictTo.value.trim()
  if (!from || !to) return
  dictEntries.push({ from, to })
  saveDictEntries()
  renderDict()
  dictFrom.value = ''
  dictTo.value   = ''
  dictFrom.focus()
}
