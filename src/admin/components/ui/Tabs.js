"use client"

import { createContext, useContext } from "react"
import { clsx } from "clsx"

const TabsContext = createContext()

export const Tabs = ({ value, onValueChange, className, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={clsx("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className, children }) => {
  return (
    <div
      className={clsx(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
        className,
      )}
    >
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, className, children }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isActive = selectedValue === value

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-gray-950 shadow-sm" : "text-gray-600 hover:text-gray-900",
        className,
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, className, children }) => {
  const { value: selectedValue } = useContext(TabsContext)

  if (selectedValue !== value) return null

  return (
    <div
      className={clsx(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  )
}
