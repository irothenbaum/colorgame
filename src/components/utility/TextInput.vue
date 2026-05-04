<script setup lang="ts">
import {ref} from 'vue'
import {v4 as uuid} from 'uuid'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import FloatLabel from 'primevue/floatlabel'

const id = ref(uuid())

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    error?: boolean
    readonly?: boolean
    lines?: number
    maxlength?: number
  }>(),
  {
    modelValue: '',
    error: false,
    readonly: false,
    lines: 1,
    maxlength: undefined,
  },
)

// Emits definition
const emit = defineEmits<{
  (e: 'update:modelValue', data: string | undefined): void
}>()
</script>

<template>
  <span class="text-input">
    <FloatLabel variant="on">
      <InputText
        v-if="lines === 1"
        :id="id"
        :model-value="modelValue"
        variant="filled"
        :invalid="error"
        :readonly="readonly"
        :maxlength="maxlength"
        @update:modelValue="(v: string | undefined) => emit('update:modelValue', v)"
      />
      <Textarea
        v-if="lines > 1"
        :id="id"
        :model-value="modelValue"
        variant="filled"
        :rows="lines"
        :invalid="error"
        :readonly="readonly"
        :maxlength="maxlength"
        @update:modelValue="(v: string | undefined) => emit('update:modelValue', v)"
      />
      <label :for="id">{{ label }}</label>
    </FloatLabel>
  </span>
</template>

<style scoped lang="scss">
@use '../../styles';

.text-input {
  overflow: visible;
}
</style>
