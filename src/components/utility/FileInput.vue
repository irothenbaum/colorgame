<script setup lang="ts">
import FileUpload from 'primevue/fileupload'
import {ref} from 'vue'

// Props definition
const props = withDefaults(
  defineProps<{
    label?: string
    multiple?: boolean
    accept?: string
    maxFileSize?: number
    disabled?: boolean
    autoUpload?: boolean
  }>(),
  {
    label: 'Upload file',
    multiple: false,
    maxFileSize: 10000000, // Default max file size in B (10Mb)
    autoUpload: true,
  },
)

// Emits definition
const emit = defineEmits<{
  (e: 'upload', files: File[] | File): void
  (e: 'clear'): void
}>()

const fileupload = ref()

// Event handlers
function handleUpload(event: {files: File[]}) {
  emit('upload', props.multiple ? event.files : event.files[0])
  fileupload.value.clear() // Clear the input after selection
}

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div class="file-input">
    <label v-if="label" class="file-input-label">{{ label }}</label>
    <FileUpload
      ref="fileupload"
      :multiple="multiple"
      :accept="accept"
      :max-file-size="maxFileSize"
      :disabled="disabled"
      :auto="autoUpload"
      :show-upload-button="!autoUpload"
      :show-cancel-button="!autoUpload"
      :custom-upload="true"
      @select="handleUpload"
      @clear="handleClear"
    >
      <template #empty>
        <div class="file-drop-area"><p>Drag and drop files here</p></div>
      </template>
    </FileUpload>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';

.file-input {
  display: flex;
  flex-direction: column;

  .file-input-label {
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  .file-drop-area {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
}
</style>
