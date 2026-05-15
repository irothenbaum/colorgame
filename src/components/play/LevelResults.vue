<script setup lang="ts">
import ResultsContent from './results/ResultsContent.vue'
import Button from '@/components/utility/Button.vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'replay'): void
}>()
</script>

<template>
  <div class="level-results">
    <ResultsContent />
    <div class="controls">
      <Button @click="emit('replay')" label="Play again" />
      <Button @click="emit('back')" label="Back" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.level-results {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  top: 0;
  left: 0;
  @include styles.flex-column(0);
  justify-content: center;
  height: 100%;
  width: 100%;
  container-type: inline-size;
  z-index: 20;

  .results-content {
    // height: 100%;
    // flex 1;
    width: 100%;
  }

  .controls {
    width: 100%;
    //background: var(--color-controls-bg);
    //height: var(--controls-height);
    padding: var(--space-lg);
    @include styles.flex-row(var(--space-xxl));
    justify-content: center;

    button {
      font-size: var(--font-size-xxl);
    }
  }
}
</style>
