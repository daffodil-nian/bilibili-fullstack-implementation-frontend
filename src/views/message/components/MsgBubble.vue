<!-- MsgBubble.vue -->
<template>
  <div class="row" :class="mine ? 'mine' : 'peer'">
    <!-- 还需要表示时间的！ -->
     <div v-if="time" class="time">{{ time }}</div>
    <img v-if="!mine" class="avatar" :src="avatar || ''" alt="" />
 
    <div class="bubble">
  <template v-for="(p, i) in parts" :key="i">
    <span v-if="p.type === 'text'">{{ p.value }}</span>
       <img
  v-else
  :class="p.big ? 'sticker' : 'emoji'"
  :src="p.url"
  :alt="p.value"
/>
  </template>
</div>
    <img v-if="mine" class="avatar" :src="avatar || ''" alt="" />
  </div>
</template>
<script setup lang="ts">
import emojiList from "../../../assets/json/emoji.json";
import{computed} from 'vue'

const props=defineProps<{ 
  content: string;
 mine: boolean ;
 avatar?:string;
 time?:string;}>()

const emojiMap = Object.fromEntries(
  (emojiList as { name: string; url: string }[]).map((e) => [e.name, e.url])
)
const parts = computed(() => {
  const text = (props.content || '').trim()
  if (/^https?:\/\/.+/i.test(text)) {
    return [{ type: 'emoji' as const, value: text, url: text, big: true }]
  }
  const out: { type: 'text' | 'emoji'; value: string; url?: string; big?: boolean }[] = []
  const re = /\[[^\[\]]+\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) })
    const code = m[0]
    const url = emojiMap[code]
    if (url) out.push({ type: 'emoji', value: code, url })
    else out.push({ type: 'text', value: code })
    last = m.index + code.length
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
  return out
})
// const parts = computed(() => {
//   const text = props.content || ''
//   const out: { type: 'text' | 'emoji'; value: string; url?: string }[] = []
//   const re = /\[[^\[\]]+\]/g
//   let last = 0
//   let m: RegExpExecArray | null
//   while ((m = re.exec(text))) {
//     if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) })
//     const code = m[0]
//     const url = emojiMap[code]
//     if (url) out.push({ type: 'emoji', value: code, url })
//     else out.push({ type: 'text', value: code })
//     last = m.index + code.length
//   }
//   if (last < text.length) out.push({ type: 'text', value: text.slice(last) })
//   return out
// })

</script>
<style scoped>
.row { display: flex; margin: 8px 12px; }
.peer { justify-content: flex-start; }
.mine { justify-content: flex-end; }
.emoji {
  width: 22px;
  height: 22px;
  vertical-align: text-bottom;
  
}
.sticker {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
.bubble {
  max-width: 60%;
  padding: 8px 18px;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 8px;
  font-size: 14px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e3e5e7;
}
.peer .bubble { background: #fff; }
.mine .bubble { background: #00aeec; color: #fff; }
</style>