<script setup lang="ts">
defineProps<{
  icon: string
}>()
</script>

<template>
  <span class="rainbow-icon">
    <i :class="icon" />
    <i :class="icon" aria-hidden="true" />
  </span>
</template>

<style scoped lang="scss">
@use '../../styles';

.rainbow-icon {
  position: relative;
  display: inline-block;

  i + i {
    position: absolute;
    inset: 0;
    @include styles.rainbow-sweep();
  }
}
</style>
