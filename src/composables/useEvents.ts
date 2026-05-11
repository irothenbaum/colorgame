import {onUnmounted} from 'vue'
import type {FireResult} from '@/types/gameTypes.ts'

type Handler<T> = (payload: T) => void

const listeners = new Map<string, Set<Handler<any>>>()

export function useEvents() {
  function broadcast<T>(event: EventType, payload: T) {
    listeners.get(event)?.forEach(h => h(payload))
  }

  function on<T>(event: EventType, handler: Handler<T>) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(handler)
    onUnmounted(() => listeners.get(event)?.delete(handler))
  }

  return {on, broadcast}
}

export enum EventType {
  ShotFired = 'shot-fired',
  EnemyDestroyed = 'enemy-destroyed',
  TogglePause = 'toggle-pause',
  LevelLost = 'level-lost',
  LevelWon = 'level-won'
}

export interface EventPayload {
  [EventType.ShotFired]: FireResult
  [EventType.EnemyDestroyed]: {
    enemyId: string
  },
  [EventType.TogglePause]: boolean,
  [EventType.LevelWon]: undefined,
  [EventType.LevelLost]: undefined,
}
