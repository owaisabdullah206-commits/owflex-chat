'use client'

import { useEffect, useState } from 'react'

const KEY = 'octively-theme'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(KEY) === 'dark') {
      setDark(true)
    }
  }, [])

  function toggleDark() {
    setDark((d) => {
      const next = !d
      localStorage.setItem(KEY, next ? 'dark' : 'light')
      return next
    })
  }

  return { dark, toggleDark }
}
