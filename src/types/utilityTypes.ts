import type { Ref } from 'vue'

export type Reactive<T> = {
  [K in keyof T]: Ref<T[K]>
}
