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
