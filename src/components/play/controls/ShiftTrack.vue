<script setup lang="ts">
defineProps<{
  value: 1 | -1
}>()
</script>

<template>
  <div class="shift-track">
    <span class="sign">{{ value === 1 ? '>' : '<' }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.shift-track {
  height: 100%;
  width: 100%;
  background: var(--color-light-grey);
  border-radius: var(--space-md);
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;

  .sign {
    @include styles.block-text;
    font-size: min(70cqw, 90cqh);
    line-height: 1;
    color: var(--color-dark-grey);
  }
}
</style>
