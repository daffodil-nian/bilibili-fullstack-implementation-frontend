<!-- views/message/index.vue -->
<template>
  <MessagePanel />
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MessagePanel from './components/MessagePanel/index.vue'
import { useChatStore } from '../../stores/chat'

const route = useRoute()
const chatStore = useChatStore()

onMounted(async () => {
  await chatStore.init()
  const peer = Number(route.query.peerUid)
  if (!Number.isNaN(peer) && peer > 0) {
    await chatStore.openByPeerUid(peer)
  }
})
</script>