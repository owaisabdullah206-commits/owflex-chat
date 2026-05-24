'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

// useLayoutEffect fires synchronously after DOM mutations but BEFORE the
// browser paints — so dark mode is applied before the first visible frame.
// On the server useLayoutEffect is not available; fall back to useEffect
// (no visual output server-side anyway).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const KEY = 'octively-theme'

export function useDarkMode() {
  const [dark, setDark] = useState(false)

  useIsomorphicLayoutEffect(() => {
    if (localStorage.getItem(KEY) === 'dark') setDark(true)
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
