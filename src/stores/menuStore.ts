import { defineStore } from 'pinia'
import { ref } from 'vue'
import {type MenuState, Scene} from '@/types/menuTypes.ts'
import type {Reactive} from '@/types/utilityTypes.ts'

export interface MenuStore extends Reactive<MenuState> {
  goToScene: (newScene: Scene) => void
}

export const useMenuStore = defineStore('menu', (): MenuStore => {
  const scene = ref<Scene>(Scene.SCENE_SELECT)
  const sceneSelectScrollTop = ref<number | null>(null)

  function goToScene(newScene: Scene) {
    if (scene.value === newScene) {
      return
    }
    scene.value = newScene
  }

  return {
    scene,
    sceneSelectScrollTop,
    goToScene,
  }
})
