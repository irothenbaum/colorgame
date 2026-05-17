<script setup lang="ts">
import {ref, onMounted} from 'vue'

const emit = defineEmits<{
  (e: 'grade-shown'): void
}>()

const contentVisible = ref(false)
const stampVisible = ref(false)

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

onMounted(async () => {
  // Almost no initial delay
  await delay(100)
  contentVisible.value = true

  await delay(600)
  stampVisible.value = true

  await delay(500)
  emit('grade-shown')
})
</script>

<template>
  <div class="failed-content">
    <div class="main-content" :class="{visible: contentVisible}">
      <div class="stamp" :class="{'stamp-visible': stampVisible}">FAILED</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

@keyframes stamp-pop {
  from {
    opacity: 0;
    transform: scale(4) rotate(-20deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(10deg);
  }
}

.failed-content {
  @include styles.flex-column();
  justify-content: center;
  z-index: 100;
  color: var(--color-text);
  padding: var(--space-lg);

  .main-content {
    @include styles.flex-column();
    width: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-out;

    &.visible {
      opacity: 1;
    }
  }

  .stamp {
    font-size: calc(var(--font-size-xxl) * 2.5);
    font-weight: bold;
    color: #cc2222;
    line-height: 1;
    letter-spacing: 0.08em;
    opacity: 0;
    transform-origin: center center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    @include styles.text-shadow(6px, 0.25);

    &.stamp-visible {
      animation: stamp-pop 0.2s ease-in both;
    }
  }
}
</style>
