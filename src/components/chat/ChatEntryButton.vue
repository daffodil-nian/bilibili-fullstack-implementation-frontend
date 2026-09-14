<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{ peerUid: number }>()
const router = useRouter()

function go() {
  router.push({ path: '/message', query: { peerUid: String(props.peerUid) } })
}
</script>

<template>
  <button type="button" class="chat-btn" @click="go">发消息</button>
</template>

<style scoped>
.chat-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #00aeec;
  border-radius: 6px;
  background: #fff;
  color: #00aeec;
  cursor: pointer;
}
</style>