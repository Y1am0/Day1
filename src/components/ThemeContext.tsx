"use client";

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react'
import { getInitialTheme, applyTheme } from '@/lib/themeUtils'

type Theme = 'light' | 'dark' | null

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Use this effect for applying the theme
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(null)

  useIsomorphicLayoutEffect(() => {
    setTheme(getInitialTheme())
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (theme) {
      applyTheme(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}