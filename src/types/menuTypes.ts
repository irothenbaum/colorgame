export enum Scene {
  SCENE_SELECT = 'menu',
  PLAY_LEVEL = 'play-level',
  TRAINING = 'training',
  TUTORIAL = 'tutorial',
  ENDLESS = 'endless',
}

export interface MenuState {
  scene: Scene
  sceneSelectScrollTop: number | null
}
