import { SEED_CACHE_KEY } from '@/constants/environment'

export function shuffleArray<T>(arr: Array<T>): Array<T> {
  const clone = [...arr]
  let currentIndex = clone.length

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(dRandom() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[clone[currentIndex], clone[randomIndex]] = [clone[randomIndex], clone[currentIndex]]
  }

  return clone
}

// Deterministic random state
let dRandomState: number | null = null
let dRandomLastCode: string | null = null

function seedToNumber(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Mulberry32 PRNG - fast and produces good distribution
function mulberry32(): number {
  if (dRandomState === null) return Math.random()
  dRandomState += 0x6d2b79f5
  let t = dRandomState
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function dRandom(): number {
  const competeCode = localStorage.getItem(SEED_CACHE_KEY)

  if (competeCode) {
    // Reset state if the code changed
    if (competeCode !== dRandomLastCode) {
      resetSeed()
    }
    return mulberry32()
  } else {
    dRandomState = null
    dRandomLastCode = null
    return Math.random()
  }
}

export function resetSeed(): void {
  const competeCode = localStorage.getItem(SEED_CACHE_KEY)
  if (competeCode) {
    dRandomState = seedToNumber(competeCode)
    dRandomLastCode = competeCode
  }
}
