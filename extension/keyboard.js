// MAIN world + document_start でページのJSより先に登録
window.addEventListener('keydown', (e) => {
  if (e.code !== 'F9') return

  // VoiceInk 内にフォーカスがある場合はブラウザのデフォルト（ボタンクリック）に任せる
  const ae = document.activeElement
  if (ae && ae.closest && ae.closest('#voiceink-root')) return

  e.preventDefault()
  e.stopImmediatePropagation()
  window.postMessage({ type: 'VOICEINK_SPACE' }, '*')
}, true)
