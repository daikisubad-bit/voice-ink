// MAIN world + document_start でページのJSより先に登録
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  const ae = document.activeElement
  // VoiceInk のボタンにフォーカスがある場合は通す
  if (ae && ae.closest && ae.closest('#voiceink-root')) {
    e.preventDefault()
    e.stopImmediatePropagation()
    window.postMessage({ type: 'VOICEINK_SPACE' }, '*')
    return
  }
  const tag = ae?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return
  e.preventDefault()
  e.stopImmediatePropagation()
  window.postMessage({ type: 'VOICEINK_SPACE' }, '*')
}, true)
