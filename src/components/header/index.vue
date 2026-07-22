<template>
  <div class="header-banner-wrap">
    <div
      class="banner"
      :style="{ height: height + 'px' }"
      @mouseover="onMouseOver"
      @mousemove="onMouseMove"
      @mouseleave="onMouseOut"
    >
      <div v-for="(layer, index) in layers" :key="index" class="image">
        <img
          :width="layer.width"
          :height="layer.height"
          :src="layerIndexSrc(index)"
          :style="layerStyles[index]"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import bg from './images/bg.png'
import girl1 from './images/girl1.png'
import girl2 from './images/girl2.png'
import girl3 from './images/girl3.png'
import girl4 from './images/girl4.png'
import grassland from './images/grassland.png'
import mushroom from './images/mushroom.png'
import spirit from './images/spirit.png'
import leaf from './images/leaf.png'

withDefaults(defineProps<{
  /** 头图高度，单位 px，各页面可传不同值 */
  height?: number
}>(), {
  height: 155,
})

const girlFrames = [girl1, girl2, girl3, girl4]

const layers = [
  { width: 3000, height: 250, src: bg },
  { width: 1800, height: 165, src: girl1 },
  { width: 3000, height: 250, src: grassland },
  { width: 1800, height: 160, src: mushroom },
  { width: 1800, height: 165, src: spirit },
  { width: 1950, height: 178, src: leaf },
]

const dataImages = [
  { x: 0, b: 4 },
  { x: 0, b: 0 },
  { x: 0, b: 1 },
  { x: 0, b: 4 },
  { x: 0, b: 5 },
  { x: 0, b: 6 },
]

const layerStyles = reactive(
  dataImages.map((item) => ({
    transition: '0.2s linear',
    transform: `translate(${item.x}px)`,
    filter: `blur(${item.b}px)`,
  })),
)

const blinkIndex = ref(0)
const girlSrc = ref(girl1)

const layerIndexSrc = (index: number) => (index === 1 ? girlSrc.value : layers[index].src)

let x = 0
let blinkTimer: ReturnType<typeof setTimeout> | null = null

const applyInitStyles = () => {
  dataImages.forEach((item, key) => {
    layerStyles[key].transition = '0.2s linear'
    layerStyles[key].transform = `translate(${item.x}px)`
    layerStyles[key].filter = `blur(${item.b}px)`
  })
}

const onMouseOver = (e: MouseEvent) => {
  x = e.clientX
}

const onMouseMove = (e: MouseEvent) => {
  const xNew = e.clientX
  const xOffset = x - xNew
  const step = document.documentElement.clientWidth / 2 / 5

  dataImages.forEach((item, key) => {
    const level = (6 - key) * 10
    const bNew = Math.abs(item.b + xOffset / step)
    const lNew = 0 - xOffset / level
    layerStyles[key].transition = ''
    layerStyles[key].transform = `translate(${lNew}px)`
    layerStyles[key].filter = `blur(${bNew}px)`
  })
}

const onMouseOut = () => {
  applyInitStyles()
}

const blink = () => {
  let timeout = 30
  if (blinkIndex.value === 4) {
    blinkIndex.value = 1
    timeout = 4000
  } else {
    blinkIndex.value += 1
    timeout = 30
  }
  girlSrc.value = girlFrames[blinkIndex.value - 1] ?? girl1
  blinkTimer = setTimeout(blink, timeout)
}

onMounted(() => {
  applyInitStyles()
  blink()
})

onUnmounted(() => {
  if (blinkTimer) clearTimeout(blinkTimer)
})
</script>

<style scoped src="./style.css"></style>
