<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import InputNumber from 'primevue/inputnumber'
import FloatLabel from 'primevue/floatlabel'

const id = ref(uuid())

const props = withDefaults(
  defineProps<{
    modelValue?: number
    label?: string
    readonly?: boolean
    error?: boolean
    suffix?: string
    prefix?: string
  }>(),
  {
    error: false,
    readonly: false,
  },
)

// Emits definition
const emit = defineEmits<{
  (e: 'update:modelValue', data: number | undefined): void
}>()
</script>

<template>
  <span class="number-input">
    <FloatLabel variant="on">
      <InputNumber
        :id="id"
        :model-value="modelValue"
        variant="filled"
        :invalid="error"
        @update:modelValue="(v: number | undefined) => emit('update:modelValue', v)"
        :suffix="suffix"
        :prefix="prefix"
        :readonly="readonly"
      />
      <label :for="id">{{ label }}</label>
    </FloatLabel>
  </span>
</template>

<style scoped lang="scss">
@use '../../styles';

.number-input {
  overflow: visible;
}
</style>
