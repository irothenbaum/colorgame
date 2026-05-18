<script setup lang="ts">
import {computed} from 'vue'

const RANK_BASE = 4

const props = withDefaults(
  defineProps<{
    rank: number
    color: string
  }>(),
  {
    rank: 0,
    color: 'var(--color-grey)',
  },
)

const largeBarsCount = computed(() => Math.floor(props.rank / RANK_BASE))
const smallBarsCount = computed(() => (props.rank - largeBarsCount.value * RANK_BASE) % RANK_BASE)

console.log(smallBarsCount.value)
</script>

<template>
  <div class="accent-bar" :style="{backgroundColor: color, borderColor: color}">
    <span v-for="i in largeBarsCount" :key="'large-' + i" class="rank-bar large" />
    <span v-for="i in smallBarsCount" :key="'small-' + i" class="rank-bar small" />
  </div>
</template>

<style scoped lang="scss">
@use '../styles';
.accent-bar {
  width: 100%;
  height: 100%;

  padding-top: 10vh;

  .rank-bar {
    display: block;
    width: 100%;
    background-color: var(--color-white);
    margin-bottom: var(--space-xs);
    border-left: 2px solid var(--color-light-grey);
    border-right: 2px solid var(--color-light-grey);

    &.large {
      height: var(--space-lg);
    }

    &.small {
      height: var(--space-sm);
    }
  }
}
</style>
