<script setup lang="ts">
import PrimeTable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import Spinner from '@/components/utility/Spinner.vue'

export interface TableColumn {
  field: string
  header: string
}

const emit = defineEmits<{
  (e: 'update:filters', filters: Record<string, any>): void
}>()

withDefaults(
  defineProps<{
    data: Array<any>
    columns?: Array<TableColumn>
    loading?: boolean
    sort?: string
    sortOrder?: number
    filters?: Record<string, any>
  }>(),
  {
    loading: false,
    sortOrder: 1,
  },
)
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <Spinner />
  </div>
  <div v-else>
    <PrimeTable
      :filters="filters"
      @update:filters="emit('update:filters', $event)"
      paginator
      removableSort
      :rows="10"
      :value="data"
      stripedRows
      :sortField="sort"
      :sortOrder="sortOrder"
      filterDisplay="menu"
    >
      <slot name="columns">
        <PrimeColumn v-if="columns" v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
      </slot>

      <template #empty>
        <slot name="empty"> No records found </slot>
      </template>
    </PrimeTable>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles';
</style>
