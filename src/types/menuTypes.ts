export enum Scene {
  SCENE_SELECT = 'menu',
  PLAY_LEVEL = 'play-level',
  TRAINING = 'training',
  TUTORIAL = 'tutorial',
  ENDLESS = 'endless',
  DAILY = 'daily',
}

export interface MenuState {
  gameHasLoaded: boolean
  scene: Scene
  sceneParams: Record<string, string|number>
  sceneSelectScrollTop: number | null
}
