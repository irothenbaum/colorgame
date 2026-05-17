import { defineStore } from 'pinia'
import { ref } from 'vue'
import {type MenuState, Scene} from '@/types/menuTypes.ts'
import type {Reactive} from '@/types/utilityTypes.ts'

export interface MenuStore extends Reactive<MenuState> {
  goToScene: (newScene: Scene) => void
}

export const useMenuStore = defineStore('menu', (): MenuStore => {
  const gameHasLoaded = ref(false)
  const scene = ref<Scene>(Scene.SCENE_SELECT)
  const sceneParams = ref<Record<string, string|number>>({})
  const sceneSelectScrollTop = ref<number | null>(null)

  function goToScene(newScene: Scene, params?: Record<string, string|number>) {
    if (scene.value === newScene) {
      return
    }

    if (params) {
      sceneParams.value = params
    } else {
      sceneParams.value = {}
    }
    scene.value = newScene
  }

  return {
    gameHasLoaded,
    scene,
    sceneParams,
    sceneSelectScrollTop,
    goToScene,
  }
})
