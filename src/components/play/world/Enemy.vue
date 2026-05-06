<script setup lang="ts">
import {computed} from 'vue'
import type {EnemyState} from '@/types/gameTypes.ts'
import {colorHealthToColor} from '@/helpers/colorUtils.ts'
import {getValueFromHealth} from '@/helpers/gameUtils.ts'
import {VERTICAL_UNITS} from '@/constants/environment.ts'

const props = defineProps<{
  enemy: EnemyState
}>()

const enemyColor = computed(() => colorHealthToColor(props.enemy.healthRemaining))
const healthValue = computed(() => getValueFromHealth(props.enemy.healthRemaining))
const renderHeightCQH = computed(() => healthValue.value * 100 / VERTICAL_UNITS) // each health point is worth 0.5cqh in height

</script>

<template>
  <div class="enemy" :style="{backgroundColor: enemyColor, height: renderHeightCQH + 'cqh'}">
    <span v-for="i in healthValue" :key="i" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../styles';

.enemy {
  width: 100%;
  // height set inline based on health
  @include styles.flex-row(var(--space-xs));
  justify-content: space-evenly;
  padding: var(--space-xs);
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--color-shadow-light);
  }

  span {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius-sm);
    background-color: inherit;
  }
}
</style>
