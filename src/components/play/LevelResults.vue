<script setup lang="ts">
import {ref} from 'vue'
import ResultsContent from './results/ResultsContent.vue'
import Button from '@/components/utility/Button.vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'replay'): void
}>()

const controlsVisible = ref(false)

function onGradeShown() {
  controlsVisible.value = true
  console.log("Test")
}
</script>

<template>
  <div class="level-results">
    <ResultsContent @grade-shown="onGradeShown" />
    <div class="controls" :class="{visible: controlsVisible}">
      <Button @click="emit('replay')" label="Play again" />
      <Button @click="emit('back')" label="Back" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

@keyframes bg-fade-in {
  from {
    background: rgba(255, 255, 255, 0);
  }
  to {
    background: rgba(255, 255, 255, 0.92);
  }
}

.level-results {
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  animation: bg-fade-in 0.5s ease-out both;
  top: 0;
  left: 0;
  @include styles.flex-column(0);
  justify-content: center;
  height: 100%;
  width: 100%;
  container-type: inline-size;
  z-index: 20;

  .results-content {
    width: 100%;
  }

  .controls {
    width: 100%;
    padding: var(--space-lg);
    @include styles.flex-row(var(--space-xxl));
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease-out;

    &.visible {
      opacity: 1;
      pointer-events: auto;
    }

    button {
      font-size: var(--font-size-xxl);

      @include styles.small-and-below() {
        font-size: var(--font-size-lg);
      }
    }
  }
}
</style>
