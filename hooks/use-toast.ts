"use client"

// Inspired by shadcn/ui toast implementation
// Simplified for this project

import * as React from "react"

export interface ToastConfig {
  id?: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

// Global State
let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastConfig }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToastConfig[]
}

let memoryState: State = { toasts: [] }
const listeners: Array<(state: State) => void> = []

function dispatch(action: ToastAction) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, 5), // Limit to 5 toasts
      }
      break
    case "DISMISS_TOAST":
      // In this simple implementation, dismiss just removes. 
      // Full implementation might have an 'open' state.
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        memoryState = { ...memoryState, toasts: [] }
      } else {
        memoryState = {
          ...memoryState,
          toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
        }
      }
      break
  }

  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Usage in Components
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    toasts: state.toasts,
    addToast: (props: Omit<ToastConfig, "id">) => {
      const id = genId()
      const newToast = { ...props, id }
      dispatch({ type: "ADD_TOAST", toast: newToast })

      if (props.duration !== Infinity) {
        setTimeout(() => {
          dispatch({ type: "DISMISS_TOAST", toastId: id })
        }, props.duration || 5000)
      }
      return id
    },
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    toast: (props: Omit<ToastConfig, "id">) => {
      const id = genId()
      dispatch({ type: "ADD_TOAST", toast: { ...props, id } })
      return id
    }
  }
}

// Standalone function if needed outside hooks
export const toast = (props: Omit<ToastConfig, "id">) => {
  const id = genId()
  dispatch({ type: "ADD_TOAST", toast: { ...props, id } })
  return id
}