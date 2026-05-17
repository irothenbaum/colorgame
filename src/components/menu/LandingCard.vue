<script setup lang="ts">

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

.landing-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: var(--color-white);
}

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
  font-size: 40cqw;
  line-height: 0.9;
  letter-spacing: -0.01em;

  .h-letter {
    color: var(--color-pastel-red);
  }
  .u-letter {
    color: var(--color-pastel-green);
  }
  .e-letter {
    color: var(--color-pastel-blue);
  }
}

.blitz-title {
  position: relative;
  font-family: var(--font-family-title);
  font-weight: 600;
  font-size: 27cqw;
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
</style>
