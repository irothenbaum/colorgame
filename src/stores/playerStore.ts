import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {Reactive} from '@/types/utilityTypes.ts'
import type {PlayerState} from '@/types/playerTypes.ts'
import type {ColorValue} from '@/types/colorTypes.ts'

export interface PlayerStore extends Reactive<PlayerState> {
  prepareNewLevel: () => void
  getLoadedColorValue: () => ColorValue
}

export const usePlayerStore = defineStore('player', (): PlayerStore => {
  const redLoaded = ref(0)
  const greenLoaded = ref(0)
  const blueLoaded = ref(0)
  const redReload = ref(0)
  const greenReload = ref(0)
  const blueReload = ref(0)

  function prepareNewLevel() {
    redLoaded.value = 0
    greenLoaded.value = 0
    blueLoaded.value = 0
    redReload.value = 0
    greenReload.value = 0
    blueReload.value = 0
  }

  function getLoadedColorValue(): ColorValue {
    return {
      red: redLoaded.value,
      green: greenLoaded.value,
      blue: blueLoaded.value
    }
  }

  const canFire = computed<boolean>(() => {
    // must have at least 1 loaded color, and all loaded colors must not be in Reload state
    return (
        (redLoaded.value === 0 || redReload.value === 0) // not loaded, or not in reload
        && (greenLoaded.value === 0 || greenReload.value === 0) // not loaded, or not in reload
        && (blueLoaded.value === 0 || blueReload.value === 0) // not loaded, or not in reload
      )
      && (redLoaded.value + greenLoaded.value + blueLoaded.value > 0) // at least 1 loaded
  })

  return {
    redLoaded,
    greenLoaded,
    blueLoaded,
    redReload,
    greenReload,
    blueReload,
    canFire,

    // actions
    prepareNewLevel,
    getLoadedColorValue
  }
})
