// ページのJSより先に登録することでSpaceキーを確実に取得する
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  const ae = document.activeElement
  const tag = ae?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return
  // content.js に通知
  window.dispatchEvent(new CustomEvent('voiceink-space-key'))
  e.preventDefault()
  e.stopImmediatePropagation()
}, true)
