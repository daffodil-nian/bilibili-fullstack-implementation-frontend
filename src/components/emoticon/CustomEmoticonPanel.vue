<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { get, postForm } from '../../services/request'

type Item = { id: number; code: string; name: string; url: string }
type Pack = { id: number; type: number; name: string; emoticonItems: Item[] }

const emit = defineEmits<{ pick: [item: { code: string; url: string }] }>()
const items = ref<Item[]>([])
const fileRef = ref<HTMLInputElement | null>(null)

async function load() {
  const res = await get('/api/emoticon/panel')
  const packs = (res.data || []) as Pack[]
  const mine = packs.find((p) => p.type === 2)
  items.value = mine?.emoticonItems || []
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const fd = new FormData()
  fd.append('file', file)
  fd.append('name', file.name.replace(/\.\w+$/, '') || '自定义')

  const res = await postForm('/api/emoticon/upload', fd)
  const item = res.data as Item
  if (item?.code) items.value = [item, ...items.value]
}

onMounted(load)
</script>

<template>
  <div class="panel">
    <div class="title">我的表情</div>
    <div class="grid">
      <button type="button" class="cell plus" @click="fileRef?.click()">+</button>
      <input ref="fileRef" hidden type="file" accept="image/png,image/jpeg" @change="onFile" />
      <button
        v-for="it in items"
        :key="it.id || it.code"
        type="button"
        class="cell"
        :title="it.code"
  @click="emit('pick', { code: it.code, url: it.url })"
      >
        <img :src="it.url" :alt="it.code" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.panel {
  width: 320px;
  max-height: 240px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 8px;
  overflow: auto;
}
.title { font-size: 12px; color: #9499a0; margin-bottom: 6px; padding: 0 4px; }
.grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; }
.cell {
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.cell:hover { background: #f1f2f3; }
.plus { font-size: 22px; color: #9499a0; }
.cell img { width: 28px; height: 28px; object-fit: contain; pointer-events: none; }
</style>