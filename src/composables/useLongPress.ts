import {onUnmounted, ref} from 'vue'

export function useLongPress(onTap: () => void, onLongPress: () => void, duration = 1000) {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)
  const fired = ref(false)
  const touchActive = ref(false)
  const pressing = ref(false)
  let touchActiveTimer: ReturnType<typeof setTimeout> | null = null

  const startTimer = () => {
    fired.value = false
    pressing.value = true
    timer.value = setTimeout(() => {
      fired.value = true
      pressing.value = false
      onLongPress()
    }, duration)
  }

  const scheduleClearTouchActive = () => {
    if (touchActiveTimer) {
      clearTimeout(touchActiveTimer)
    }
    // keep touchActive true long enough to swallow the synthetic mouse events browsers fire after touch
    touchActiveTimer = setTimeout(() => {
      touchActive.value = false
      touchActiveTimer = null
    }, 300)
  }

  const onTouchstart = (e: TouchEvent) => {
    // Cancel any pending touchActive clear so a rapid tap+longpress doesn't
    // let the first tap's 300ms window expire mid-interaction
    if (touchActiveTimer) {
      clearTimeout(touchActiveTimer)
      touchActiveTimer = null
    }
    touchActive.value = true
    startTimer()
  }

  const onContextmenu = (e: Event) => {
    e.preventDefault()
  }

  const onTouchend = () => {
    pressing.value = false
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    if (!fired.value) {
      onTap()
    }
    fired.value = false
    scheduleClearTouchActive()
  }

  const onTouchcancel = () => {
    abort()
    scheduleClearTouchActive()
  }

  const onMousedown = () => {
    if (touchActive.value) {
      return
    }
    startTimer()
  }

  const onMouseup = () => {
    if (touchActive.value) {
      return
    }
    pressing.value = false
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    if (!fired.value) {
      onTap()
    }
    fired.value = false
  }

  const onMouseleave = () => {
    if (touchActive.value) {
      return
    }
    abort()
  }

  const abort = () => {
    pressing.value = false
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    fired.value = false
  }

  onUnmounted(() => {
    abort()
    if (touchActiveTimer) {
      clearTimeout(touchActiveTimer)
    }
  })

  return {
    pressing,
    events: {
      touchstart: onTouchstart,
      touchend: onTouchend,
      touchcancel: onTouchcancel,
      mousedown: onMousedown,
      mouseup: onMouseup,
      mouseleave: onMouseleave,
      contextmenu: onContextmenu,
    }
  }
}
