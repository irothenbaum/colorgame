<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps<{
  progress: number  // 0 to 1
}>()

const maskWidth = computed(() => (1 - props.progress) * 100)
</script>

<template>
  <div class="level-progress">
    <div class="level-progress-mask" :style="{width: `${maskWidth}%`}" />
  </div>
</template>

<style scoped lang="scss">
@keyframes rainbow-scroll {
  from { background-position: 0 center; }
  to   { background-position: 400px center; }
}

.level-progress {
  width: 100%;
  height: var(--space-sm);
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(
    90deg,
    hsl(0,   100%, 55%),
    hsl(40,  100%, 55%),
    hsl(80,  100%, 45%),
    hsl(160, 100%, 45%),
    hsl(200, 100%, 55%),
    hsl(240, 100%, 60%),
    hsl(280, 100%, 55%),
    hsl(320, 100%, 55%),
    hsl(360, 100%, 55%)
  );
  background-size: 400px 100%;
  animation: rainbow-scroll 2s linear infinite;
}

.level-progress-mask {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  background: black;
  transition: width 0.4s ease-out;
}
</style>
