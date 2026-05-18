export enum Scene {
  SCENE_SELECT = 'menu',
  PLAY_LEVEL = 'play-level',
  TRAINING = 'training',
  TUTORIAL = 'tutorial',
  ENDLESS = 'endless',
  DAILY = 'daily',
  LEVEL_BUILDER = 'level-builder',
}

export interface MenuState {
  gameHasLoaded: boolean
  scene: Scene
  sceneParams: Record<string, string|number>
  sceneSelectScrollTop: number | null
}
