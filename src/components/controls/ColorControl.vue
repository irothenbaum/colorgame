<script setup lang="ts">
import {computed} from 'vue'
import {storeToRefs} from 'pinia'
import {ColorType} from '@/types/colorTypes'
import {usePlayerStore} from '@/stores/playerStore'

const props = defineProps<{
  color: ColorType
}>()

const playerStore = usePlayerStore()
const refs = storeToRefs(playerStore)
const colorLoaded = refs[`${props.color}Loaded` as 'redLoaded' | 'greenLoaded' | 'blueLoaded']
const colorReload = refs[`${props.color}Reload` as 'redReload' | 'greenReload' | 'blueReload']

const isReloading = computed<boolean>(() => {
  return colorReload.value > 0
})

const isActive = computed<boolean>(() => {
  return colorLoaded.value > 0 && !isReloading.value
})

</script>

<template>
  <div class="color-control" :class="color"></div>
</template>

<style scoped lang="scss">
@use '../../styles';

.color-control {
  height: 100%;
  width: 100%;

  &.red {
    background: var(--color-red);
    &.reloading {
      background: var(--color-red-disabled);
    }
  }

  &.blue {
    background: var(--color-blue);
    &.reloading {
      background: var(--color-blue-disabled);
    }
  }

  &.green {
    background: var(--color-green);
    &.reloading {
      background: var(--color-green-disabled);
    }
  }

}
</style>
