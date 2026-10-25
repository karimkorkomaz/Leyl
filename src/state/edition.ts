import { useSyncExternalStore } from 'react'
import { defaultEdition, editions, type EditionId } from '../content'

// The active edition: the one piece of React state the story needs (text depends on it).
// It changes on click, never per frame. The 3D side follows it through sceneState.look.edition.

let current: EditionId = defaultEdition
const listeners = new Set<() => void>()

export const getEdition = () => current
export const getEditionData = (id: EditionId = current) => editions.find((e) => e.id === id)!

export function setEdition(id: EditionId) {
  if (id === current) return
  current = id
  for (const fn of listeners) fn()
}

export function subscribeEdition(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export const useEdition = () => useSyncExternalStore(subscribeEdition, getEdition)
