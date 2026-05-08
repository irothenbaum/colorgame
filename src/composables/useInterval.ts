export interface TimerHandle {
  cancel: () => void
  pause: () => void
  resume: () => void
  msElapsed: () => number
  msRemaining: () => number
}

export function useTimeout(callback: () => void, delayMs: number): TimerHandle {
  let id: ReturnType<typeof setTimeout> | null = null
  let accumulatedMs = 0
  let cycleStartedAt = Date.now()

  const handle: TimerHandle = {
    cancel() {
      if (id !== null) clearTimeout(id)
      id = null
    },
    pause() {
      if (id === null) return
      clearTimeout(id)
      id = null
      accumulatedMs += Date.now() - cycleStartedAt
    },
    resume() {
      if (id !== null) return
      cycleStartedAt = Date.now()
      id = setTimeout(() => {
        id = null
        callback()
      }, delayMs - accumulatedMs)
    },
    msElapsed: () => accumulatedMs + (Date.now() - cycleStartedAt),
    msRemaining: () => delayMs - (accumulatedMs + (Date.now() - cycleStartedAt)),
  }

  handle.resume()
  return handle
}

export function useInterval(callback: () => void, intervalMs: number): TimerHandle {
  let id: ReturnType<typeof setTimeout> | null = null
  let accumulatedMs = 0
  let cycleStartedAt = Date.now()

  function scheduleNext(delayMs: number) {
    id = setTimeout(() => {
      accumulatedMs = 0
      cycleStartedAt = Date.now()
      callback()
      scheduleNext(intervalMs)
    }, delayMs)
  }

  function msElapsedInCycle() {
    return accumulatedMs + (Date.now() - cycleStartedAt)
  }

  scheduleNext(intervalMs)

  return {
    cancel() {
      if (id !== null) clearTimeout(id)
      id = null
    },
    pause() {
      if (id === null) return
      clearTimeout(id)
      id = null
      accumulatedMs += Date.now() - cycleStartedAt
    },
    resume() {
      if (id !== null) return
      cycleStartedAt = Date.now()
      scheduleNext(intervalMs - accumulatedMs)
    },
    msElapsed: () => msElapsedInCycle(),
    msRemaining: () => intervalMs - msElapsedInCycle(),
  }
}
