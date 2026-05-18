<script setup lang="ts">
import {ref, watch, onUnmounted} from 'vue'

const props = defineProps<{
  isActive?: boolean
}>()

const idleVisible = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.isActive,
  active => {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
    idleVisible.value = false
    if (active) {
      idleTimer = setTimeout(() => {
        idleVisible.value = true
      }, 5000)
    }
  },
  {immediate: true},
)

onUnmounted(() => {
  if (idleTimer) clearTimeout(idleTimer)
})
</script>

<template>
  <div class="landing-card">
    <div class="title-group">
      <div class="hue-title">
        <span class="h-letter">H</span>
        <span class="u-letter">U</span>
        <span class="e-letter">E</span>
      </div>
      <div class="blitz-title">BLITZ</div>
    </div>
    <div v-if="idleVisible" class="idle-chevrons">
      <div class="chevron-stack">
        <i class="pi pi-chevron-down" />
        <i class="pi pi-chevron-down" />
      </div>
      <div class="chevron-stack">
        <i class="pi pi-chevron-down" />
        <i class="pi pi-chevron-down" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

@keyframes rainbow-sweep {
  0% {
    background-position: 100% center;
  }
  35% {
    background-position: 0% center;
  }
  100% {
    background-position: 0% center;
  }
}

@keyframes chevron-hint {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  15% {
    opacity: 1;
    transform: translateY(0);
  }
  70% {
    opacity: 0;
    transform: translateY(2rem);
  }
  71%,
  100% {
    opacity: 0;
    transform: translateY(0);
  }
}

.landing-card {
  @include styles.level-card();
  overflow: visible;
  z-index: 2;

  .title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    gap: 0;
  }

  .hue-title {
    font-family: var(--font-family-title);
    font-weight: 400;
    font-size: 20cqh;
    line-height: 0.85;

    $blur: 0.05em;
    $opacity: 0.2;

    .h-letter {
      color: var(--color-red-pastel);
      text-shadow: 0 0 $blur rgba(255, 0, 0, $opacity);
    }
    .u-letter {
      color: var(--color-green-pastel);
      text-shadow: 0 0 $blur rgba(0, 255, 0, $opacity);
    }
    .e-letter {
      color: var(--color-blue-pastel);
      text-shadow: 0 0 $blur rgba(0, 0, 255, $opacity);
    }
  }

  .blitz-title {
    position: relative;
    font-family: var(--font-family-title);
    font-weight: 600;
    font-size: 14cqh;
    line-height: 1;
    color: var(--color-near-black);

    &::after {
      content: 'BLITZ';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      letter-spacing: inherit;
      // gradient: transparent edges bracket the rainbow band in the center third
      background: linear-gradient(
        90deg,
        transparent 0%,
        transparent 30%,
        #ff6b6b 38%,
        #ffd93d 46%,
        #6bcb77 54%,
        #4d96ff 62%,
        #d46bff 68%,
        transparent 72%,
        transparent 100%
      );
      background-size: 400% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: rainbow-sweep 3s ease-in-out infinite;
    }
  }

  .idle-chevrons {
    position: absolute;
    bottom: -2vh;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 var(--space-xl);
    pointer-events: none;
    transform: translateY(50%);
  }

  .chevron-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.3;

    i {
      font-size: calc(var(--base-font-size) * 4);
      color: var(--color-black);
      line-height: 0.4;
      animation: chevron-hint 1.2s ease-out infinite;
    }
  }
}

.has-scrolled .idle-chevrons {
  display: none !important;
}
</style>
