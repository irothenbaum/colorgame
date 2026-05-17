import {getCurrentInstance, onUnmounted} from 'vue'
import type {FireResult, LevelState} from '@/types/gameTypes.ts'

type Handler<T> = (payload: T) => void

const listeners = new Map<string, Set<Handler<any>>>()

export enum EventType {
  ShotFired = 'shot-fired',
  EnemyDestroyed = 'enemy-destroyed',
  LevelLost = 'level-lost',
  LevelWon = 'level-won'
}

export interface EventPayload {
  [EventType.ShotFired]: FireResult
  [EventType.EnemyDestroyed]: {
    enemyId: string
  },
  [EventType.LevelWon]: {trackId: number},
  [EventType.LevelLost]: {trackId: number},
}

// Module-level functions for use in stores — no component lifecycle coupling.
export function broadcast<T extends EventType>(event: T, payload: EventPayload[T]): void {
  listeners.get(event)?.forEach(h => h(payload))
}

export function listen<T extends EventType>(event: T, handler: Handler<EventPayload[T]>): void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(handler)
}

// Composable for components — auto-removes handler via onUnmounted.
export function useEvents() {
  function componentBroadcast<T extends EventType>(event: T, payload: EventPayload[T]) {
    broadcast(event, payload)
  }

  function on<T extends EventType>(event: T, handler: Handler<EventPayload[T]>) {
    listen(event, handler)
    if (getCurrentInstance()) {
      onUnmounted(() => listeners.get(event)?.delete(handler))
    }
  }

  return {on, broadcast: componentBroadcast}
}
