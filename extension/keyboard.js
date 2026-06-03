// MAIN world + document_start でページのJSより先に登録
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  const ae = document.activeElement
  const tag = ae?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return
  e.preventDefault()
  e.stopImmediatePropagation()
  // isolated world の content.js へ postMessage で通知
  window.postMessage({ type: 'VOICEINK_SPACE' }, '*')
}, true)
