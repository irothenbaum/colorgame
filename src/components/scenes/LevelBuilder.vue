<script setup lang="ts">
import {ref, computed} from 'vue'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import type {LevelDefinition, EnemyDefinition} from '@/types/gameTypes.ts'

const menuStore = useMenuStore()

const name = ref('')
const idOverride = ref('')
const description = ref('')
const color = ref('')
const tracks = ref(1)

const computedId = computed(() =>
  name.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
)
const levelId = computed(() => idOverride.value || computedId.value || 'untitled')

interface EnemyRow {
  red: number
  green: number
  blue: number
  track: number | null
}

const enemies = ref<EnemyRow[]>([])

function addEnemy() {
  enemies.value.push({red: 1, green: 0, blue: 0, track: null})
}

function removeEnemy(index: number) {
  enemies.value.splice(index, 1)
}

function setTrack(enemy: EnemyRow, raw: string) {
  enemy.track = raw === '' ? null : Number(raw)
}

const levelDefinition = computed<LevelDefinition>(() => {
  const def: LevelDefinition = {
    id: levelId.value,
    name: name.value,
    description: description.value,
    tracks: tracks.value,
    enemies: enemies.value.map(e => {
      const enemy: EnemyDefinition = {
        type: undefined as any,
        health: {red: e.red, green: e.green, blue: e.blue},
      }
      if (e.track !== null) {
        enemy.track = e.track
      }
      return enemy
    }),
  }
  if (color.value) {
    def.color = color.value
  }
  return def
})

// Strip internal fields that have defaults and shouldn't appear in JSON files
const cleanDefinition = computed(() => {
  return {
    ...levelDefinition.value,
    enemies: levelDefinition.value.enemies.map(({type: _type, ...rest}) => rest),
  }
})

const jsonOutput = computed(() => JSON.stringify(cleanDefinition.value, null, 2))

function saveToFile() {
  const blob = new Blob([jsonOutput.value], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${levelId.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function copyToClipboard() {
  navigator.clipboard.writeText(jsonOutput.value)
}
</script>

<template>
  <div class="level-builder">
    <header class="builder-header">
      <button class="back-btn" @click="menuStore.goToScene(Scene.SCENE_SELECT)">← Back</button>
      <h1>Level Builder</h1>
    </header>

    <div class="builder-body">
      <section>
        <h2>Level Info</h2>
        <div class="field-row">
          <label>Name</label>
          <input v-model="name" type="text" placeholder="My Level" />
        </div>
        <div class="field-row">
          <label>ID</label>
          <input v-model="idOverride" type="text" :placeholder="computedId || 'untitled'" />
        </div>
        <div class="field-row">
          <label>Description</label>
          <textarea v-model="description" rows="2" />
        </div>
        <div class="field-row">
          <label>Color</label>
          <div class="color-row">
            <input type="color" :value="color || '#888888'" @input="color = ($event.target as HTMLInputElement).value" />
            <input v-model="color" type="text" placeholder="auto" />
            <button @click="color = ''" :disabled="!color">Clear</button>
          </div>
        </div>
        <div class="field-row">
          <label>Tracks</label>
          <input v-model.number="tracks" type="number" min="1" max="8" style="width: 60px" />
        </div>
      </section>

      <section>
        <h2>Enemies ({{ enemies.length }})</h2>
        <table class="enemies-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Track<br /><small>blank=rand</small></th>
              <th>R</th>
              <th>G</th>
              <th>B</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(enemy, i) in enemies" :key="i">
              <td>{{ i + 1 }}</td>
              <td>
                <input
                  :value="enemy.track ?? ''"
                  type="number"
                  min="0"
                  :max="tracks - 1"
                  placeholder="rand"
                  @input="setTrack(enemy, ($event.target as HTMLInputElement).value)"
                />
              </td>
              <td><input v-model.number="enemy.red" type="number" min="0" max="4" /></td>
              <td><input v-model.number="enemy.green" type="number" min="0" max="4" /></td>
              <td><input v-model.number="enemy.blue" type="number" min="0" max="4" /></td>
              <td>{{ enemy.red + enemy.green + enemy.blue }}</td>
              <td><button @click="removeEnemy(i)">✕</button></td>
            </tr>
          </tbody>
        </table>
        <button class="add-btn" @click="addEnemy">+ Add Enemy</button>
      </section>

      <section>
        <h2>JSON Output</h2>
        <textarea class="json-output" readonly :value="jsonOutput" rows="20" />
        <div class="action-row">
          <button @click="copyToClipboard">Copy</button>
          <button class="save-btn" @click="saveToFile">Save to File</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.level-builder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  color: var(--color-text);
  font-family: var(--font-family);
  overflow: hidden;
}

.builder-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;

  h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .back-btn {
    padding: 0.25rem 0.75rem;
    cursor: pointer;
  }
}

.builder-body {
  overflow-y: auto;
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
      margin: 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid #eee;
    }
  }
}

.field-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;

  label {
    min-width: 90px;
    font-size: 0.85rem;
    color: #555;
  }

  input[type='text'],
  textarea {
    flex: 1;
    padding: 0.25rem 0.4rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 0.85rem;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
  }
}

.color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;

  input[type='color'] {
    width: 36px;
    height: 28px;
    padding: 1px;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    flex-shrink: 0;
  }

  input[type='text'] {
    width: 90px;
    flex: none;
  }
}

.enemies-table {
  border-collapse: collapse;
  font-size: 0.85rem;
  width: 100%;

  th,
  td {
    padding: 0.3rem 0.5rem;
    text-align: center;
    border: 1px solid #ddd;

    small {
      font-size: 0.7rem;
      color: #999;
    }
  }

  th {
    background: #f5f5f5;
    font-weight: 600;
  }

  input[type='number'] {
    width: 48px;
    text-align: center;
    padding: 0.15rem;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
}

.add-btn {
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.json-output {
  width: 100%;
  font-family: monospace;
  font-size: 0.8rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  resize: vertical;
  box-sizing: border-box;
  background: #fafafa;
}

.action-row {
  display: flex;
  gap: 0.5rem;

  .save-btn {
    font-weight: 600;
  }

  button {
    padding: 0.4rem 1rem;
    cursor: pointer;
  }
}
</style>
