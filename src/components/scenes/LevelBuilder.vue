<script setup lang="ts">
import {ref, computed} from 'vue'
import {useMenuStore} from '@/stores/menuStore.ts'
import {Scene} from '@/types/menuTypes.ts'
import type {LevelDefinition, EnemyDefinition} from '@/types/gameTypes.ts'
import {EnemyType} from '@/types/gameTypes.ts'

const menuStore = useMenuStore()

const name = ref('')
const idOverride = ref('')
const description = ref('')
const color = ref('')
const tracks = ref(1)
const width = ref(0)
const thumbnail = ref('')

const computedId = computed(() =>
  name.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
)
const levelId = computed(() => idOverride.value || computedId.value || 'untitled')

interface EnemyRow {
  red: number
  green: number
  blue: number
  track: number | null
  type: EnemyType
}

const enemies = ref<EnemyRow[]>([])

function addEnemy() {
  enemies.value.push({red: 1, green: 0, blue: 0, track: null, type: EnemyType.Composite})
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
        type: e.type,
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
  if (width.value > 0) {
    def.width = width.value
  }
  if (thumbnail.value) {
    def.thumbnail = thumbnail.value
  }
  return def
})

// Strip type when it's the default (Composite) to keep JSON files clean
const cleanDefinition = computed(() => {
  return {
    ...levelDefinition.value,
    enemies: levelDefinition.value.enemies.map(e => {
      const {type, ...rest} = e
      return type === EnemyType.Atomic ? e : rest
    }),
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

// Image import
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const {data} = ctx.getImageData(0, 0, img.width, img.height)

    const newEnemies: EnemyRow[] = []
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
      if (a < 128) continue

      const nonZeroChannels = [r, g, b].filter(v => v > 0)
      if (nonZeroChannels.length === 0) continue

      const min = Math.min(...nonZeroChannels)
      newEnemies.push({
        red: Math.round(r / min),
        green: Math.round(g / min),
        blue: Math.round(b / min),
        track: null,
        type: EnemyType.Composite, // default all to Composite to start
      })
    }

    enemies.value.push(...newEnemies)
    if (width.value === 0) {
      width.value = img.width
    }
    thumbnail.value = canvas.toDataURL('image/png')
    URL.revokeObjectURL(url)
  }
  img.src = url
  ;(event.target as HTMLInputElement).value = ''
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
        <div class="field-row">
          <label>Width</label>
          <input v-model.number="width" type="number" min="0" style="width: 60px" placeholder="auto" />
        </div>
      </section>

      <section>
        <h2>Enemies ({{ enemies.length }})</h2>
        <table class="enemies-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Track<br /><small>blank=rand</small></th>
              <th>Type</th>
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
              <td>
                <select v-model="enemy.type">
                  <option :value="EnemyType.Composite">Comp.</option>
                  <option :value="EnemyType.Atomic">Atomic</option>
                </select>
              </td>
              <td><input v-model.number="enemy.red" type="number" min="0" max="4" /></td>
              <td><input v-model.number="enemy.green" type="number" min="0" max="4" /></td>
              <td><input v-model.number="enemy.blue" type="number" min="0" max="4" /></td>
              <td>{{ enemy.red + enemy.green + enemy.blue }}</td>
              <td><button @click="removeEnemy(i)">✕</button></td>
            </tr>
          </tbody>
        </table>
        <div class="enemy-actions">
          <button class="add-btn" @click="addEnemy">+ Add Enemy</button>
          <div class="import-row">
            <button @click="fileInputRef?.click()">Upload Image</button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/*"
              style="display:none"
              @change="handleImageUpload"
            />
          </div>
        </div>
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
@use '../../styles';

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
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-light-grey);
  flex-shrink: 0;

  h1 {
    font-size: var(--font-size-md);
    font-weight: 600;
    margin: 0;
  }

  .back-btn {
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
  }
}

.builder-body {
  overflow-y: auto;
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);

  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);

    h2 {
      font-size: var(--font-size-sm);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-dark-grey);
      margin: 0;
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid var(--color-light-grey);
    }
  }
}

.field-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);

  label {
    min-width: 90px;
    font-size: var(--font-size-sm);
    color: var(--color-dark-grey);
  }

  input[type='text'],
  textarea {
    flex: 1;
    padding: var(--space-xs);
    border: 1px solid var(--color-light-grey);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    font-family: inherit;
  }

  textarea {
    resize: vertical;
  }
}

.color-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;

  input[type='color'] {
    width: 36px;
    height: 28px;
    padding: 1px;
    border: 1px solid var(--color-light-grey);
    border-radius: var(--border-radius-sm);
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
  font-size: var(--font-size-sm);
  width: 100%;

  th,
  td {
    padding: var(--space-xs) var(--space-sm);
    text-align: center;
    border: 1px solid var(--color-light-grey);

    small {
      font-size: var(--font-size-xs);
      color: var(--color-grey);
    }
  }

  th {
    background: var(--color-near-white);
    font-weight: 600;
  }

  input[type='number'] {
    width: 60px;
    text-align: center;
    padding: var(--space-xs);
    border: 1px solid var(--color-light-grey);
    border-radius: var(--border-radius-sm);
  }

  select {
    font-size: var(--font-size-sm);
    padding: var(--space-xs);
    border: 1px solid var(--color-light-grey);
    border-radius: var(--border-radius-sm);
  }
}

.enemy-actions {
  @include styles.flex-row(var(--space-sm));
  justify-content: space-between;
}

.add-btn {
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.import-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);

  select {
    font-size: var(--font-size-sm);
    padding: var(--space-xs);
    border: 1px solid var(--color-light-grey);
    border-radius: var(--border-radius-sm);
  }

  button {
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
  }
}

.json-output {
  width: 100%;
  font-family: monospace;
  font-size: var(--font-size-sm);
  padding: var(--space-sm);
  border: 1px solid var(--color-light-grey);
  border-radius: var(--border-radius-sm);
  resize: vertical;
  box-sizing: border-box;
  background: var(--color-near-white);
}

.action-row {
  display: flex;
  gap: var(--space-sm);

  .save-btn {
    font-weight: 600;
  }

  button {
    padding: var(--space-xs) var(--space-md);
    cursor: pointer;
  }
}
</style>
