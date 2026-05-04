import {onUnmounted, ref} from 'vue'

export function useLongPress(onTap: () => void, onLongPress: () => void, duration = 1000) {
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)
  const fired = ref(false)
  const touchActive = ref(false)
  const pressing = ref(false)

  const startTimer = () => {
    fired.value = false
    pressing.value = true
    timer.value = setTimeout(() => {
      fired.value = true
      pressing.value = false
      onLongPress()
    }, duration)
  }

  const onTouchstart = (e: TouchEvent) => {
    touchActive.value = true
    startTimer()
  }

  const onTouchend = () => {
    touchActive.value = false
    pressing.value = false
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    if (!fired.value) onTap()
    fired.value = false
  }

  const onTouchcancel = () => {
    touchActive.value = false
    abort()
  }

  const onMousedown = () => {
    if (touchActive.value) return
    startTimer()
  }

  const onMouseup = () => {
    if (touchActive.value) return
    pressing.value = false
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
    if (!fired.value) onTap()
    fired.value = false
  }

  const onMouseleave = () => {
    if (touchActive.value) return
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

  onUnmounted(abort)

  return {
    pressing,
    events: {
      touchstart: onTouchstart,
      touchend: onTouchend,
      touchcancel: onTouchcancel,
      mousedown: onMousedown,
      mouseup: onMouseup,
      mouseleave: onMouseleave,
    }
  }
}
