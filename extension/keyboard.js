// MAIN world + document_start でページのJSより先に登録
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  const ae = document.activeElement
  const tag = ae?.tagName

  // テキスト入力欄はスルー
  if (tag === 'INPUT' || tag === 'TEXTAREA' || ae?.isContentEditable) return

  // VoiceInk 内にフォーカスがある場合はブラウザのデフォルト（ボタンクリック）に任せる
  if (ae && ae.closest && ae.closest('#voiceink-root')) return

  // それ以外：ページのSpace処理を止めて content.js に通知
  e.preventDefault()
  e.stopImmediatePropagation()
  window.postMessage({ type: 'VOICEINK_SPACE' }, '*')
}, true)
