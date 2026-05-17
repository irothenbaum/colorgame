<script setup lang="ts">
import {computed, ref} from 'vue'
import ResultsContent from './results/ResultsContent.vue'
import Button from '@/components/utility/Button.vue'
import {useGameStore} from '@/stores/gameStore.ts'
import {storeToRefs} from 'pinia'
import {PlayState} from '@/types/gameTypes.ts'
import FailedLevelContent from '@/components/play/results/FailedLevelContent.vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'replay'): void
}>()

const gameStore = useGameStore()
const {results} = storeToRefs(gameStore)
const controlsVisible = ref(false)

function onGradeShown() {
  controlsVisible.value = true
}

const lastResult = computed(() => results.value[results.value.length - 1])
</script>

<template>
  <div class="level-results" :class="{won: lastResult && lastResult.outcome === PlayState.Won, lost: lastResult && lastResult.outcome === PlayState.Lost}">
    <ResultsContent
      v-if="lastResult && lastResult.outcome === PlayState.Won"
      @grade-shown="onGradeShown"
      :result="lastResult"
    />
    <FailedLevelContent v-else @grade-shown="onGradeShown" :result="lastResult" />
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
  top: 0;
  left: 0;
  @include styles.flex-column(0);
  justify-content: center;
  height: 100%;
  width: 100%;
  container-type: inline-size;
  z-index: 20;

  &.won {
    animation: bg-fade-in 0.5s 1s ease-out both;
  }
  &.lost {
    background-color: rgba(255, 220, 220, 0.9);
    box-shadow: inset 0 0 var(--space-xl) var(--color-red);
  }

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
