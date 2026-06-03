import { useEffect, useState } from 'react'

interface Props {
  message: string
  show: boolean
}

export function Toast({ message, show }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [show])

  return (
    <div
      className={[
        'fixed bottom-36 left-1/2 -translate-x-1/2 z-50',
        'bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
      ].join(' ')}
    >
      {message}
    </div>
  )
}
