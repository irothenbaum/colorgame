<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'

const props = withDefaults(defineProps<{
  countScale: number
}>(), {
  countScale: 1,
})

const canvas = ref<HTMLCanvasElement | null>(null)
let animFrameId: number | null = null
let ro: ResizeObserver | null = null

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  spin: number
  width: number
  height: number
  color: string
}

const COLORS = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#277da1', '#c77dff']
const PIECE_COUNT = 60
const GRAVITY = 0.02
const DRAG = 0.995
const MIN_WIDTH = 18
const MAX_WIDTH = 34
const MIN_HEIGHT = 10
const MAX_HEIGHT = 20
const MIN_SPEED = 2
const MAX_SPEED = 4

function makePiece(w: number): Piece {
  return {
    x: Math.random() * w,
    y: -MAX_WIDTH - Math.random() * 60,
    vx: (Math.random() - 0.5) * 2,
    vy: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.08,
    width: MIN_WIDTH + Math.random() * (MAX_WIDTH - MIN_WIDTH),
    height: MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

onMounted(() => {
  const el = canvas.value!
  const ctx = el.getContext('2d')!

  ro = new ResizeObserver(() => {
    el.width = el.offsetWidth
    el.height = el.offsetHeight
  })
  ro.observe(el)
  el.width = el.offsetWidth
  el.height = el.offsetHeight

  const scaledPieceCount = Math.floor(PIECE_COUNT / props.countScale)

  const pieces: Piece[] = Array.from({length: scaledPieceCount}, (_, i) => {
    const p = makePiece(el.width)
    // stagger entry times so pieces arrive one at a time rather than all at once
    p.y = -el.height + (i / scaledPieceCount) * el.height
    return p
  })

  function draw() {
    ctx.clearRect(0, 0, el.width, el.height)

    for (const p of pieces) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
      ctx.restore()

      p.x += p.vx
      p.vy = p.vy * DRAG + GRAVITY
      p.y += p.vy
      p.angle += p.spin
      p.vx *= DRAG

      // recycle pieces that fall off the bottom
      if (p.y > el.height + 20) {
        Object.assign(p, makePiece(el.width))
      }
    }

    animFrameId = requestAnimationFrame(draw)
  }

  animFrameId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  if (animFrameId !== null) cancelAnimationFrame(animFrameId)
  ro?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="confetti-canvas" width="300" height="600" />
</template>

<style scoped>
.confetti-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
</style>
