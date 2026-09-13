<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore'
import {useLongPress} from '@/composables/useLongPress'
import {COLOR_RESET_DELAY_MS} from '@/constants/environment'
import Modal from '@/components/utility/Modal.vue'

defineProps<{
  show: boolean
}>()

const gameStore = useGameStore()

const {pressing: quitPressing, tapped: quitTapped, events: quitEvents} = useLongPress(
  () => {},
  () => gameStore.endGame(),
  COLOR_RESET_DELAY_MS,
)
</script>

<template>
  <Modal :show="show" @close="gameStore.togglePause(false)">
    <h1 data-text="Paused">Paused</h1>
    <div class="pause-actions">
      <button class="btn btn-primary" @click="gameStore.togglePause(false)">Resume</button>
      <div class="quit-btn-wrapper">
        <span v-if="quitTapped" class="hold-tooltip">Hold to press</span>
        <button class="btn btn-secondary" :class="{pressing: quitPressing}" v-on="quitEvents">Quit</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@use '../../styles';

h1 {
  position: relative;
  font-size: var(--font-size-xxl);
  letter-spacing: 0.05em;
  line-height: 1em;
  text-transform: uppercase;

  &::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    @include styles.rainbow-sweep();
  }
}

.pause-actions {
  @include styles.flex-row(var(--space-md));
  width: 100%;
  margin-top: var(--space-lg);
}

.btn {
  flex: 1;
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-family: inherit;
  font-size: var(--font-size-lg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  @include styles.drop-shadow();

  &.btn-primary {
    background: var(--color-near-black);
    color: var(--color-near-white);
  }

  &.btn-secondary {
    width: 100%;
    background: var(--color-light-grey);
    color: var(--color-near-black);
    @include styles.long-press-progress(left, styles.$colorResetDelay);
  }
}

.quit-btn-wrapper {
  position: relative;
  flex: 1;
}

.hold-tooltip {
  position: absolute;
  bottom: calc(100% + var(--space-sm));
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-near-black);
  color: var(--color-near-white);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  pointer-events: none;
  @include styles.drop-shadow();

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: var(--space-xs) solid transparent;
    border-top-color: var(--color-near-black);
  }
}
</style>
