<script setup lang="ts">
import {computed, toRefs} from 'vue'
import type {LevelDefinition} from '@/types/gameTypes.ts'
import {ContrastColor, darkenColor, brightenColor, getContrastColor} from '@/helpers/colorUtils.ts'

const props = defineProps<{
  level: LevelDefinition
}>()
const emit = defineEmits<{
  play: [levelId: string]
}>()

const backgroundColor = computed<string>(() => {
  return props.level.color
})

const textColor = computed<string>(() => {
  return getContrastColor(backgroundColor.value)
})
const buttonColor = computed<string>(() => {
  return textColor.value === ContrastColor.white ? darkenColor(backgroundColor.value, 0.3) : darkenColor(backgroundColor.value, 0.3)
})
const buttonTextColor = computed<string>(() => {
  return textColor.value === ContrastColor.white ? ContrastColor.black : ContrastColor.white
})
</script>

<template>
  <div class="level-card" :style="{backgroundColor: backgroundColor, color: textColor}">
    <h3>{{level.name}}</h3>
    <p>{{level.description}}</p>
    <button :style="{backgroundColor: buttonColor, color: buttonTextColor}" @click="emit('play', level.id)">
      Play
    </button>

  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.level-card {
  height: 100%;
  width: 100%;
  @include styles.flex-column();
  justify-content: center;

  h3 {
    font-size: var(--font-size-xl);
  }

  p {
    font-style: italic;
  }

  button {
    color: inherit;
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-size-xl);
    border: 0;
    border-radius: var(--border-radius-md);
    @include styles.drop-shadow();
    @include styles.text-shadow;

  }
}
</style>
