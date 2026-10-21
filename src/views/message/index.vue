<!-- views/message/index.vue -->
<template>
<div class="message-layout">
  <BilibiliHeader :with-banner="false" :banner-height="bannerHeight" :bg-opacity="0.5" />
  <MessagePanel class="message-panel"/>
</div>
</template>
<script setup lang="ts">
// import {} from 
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MessagePanel from './components/MessagePanel/index.vue'
import { useChatStore } from '../../stores/chat'
import BilibiliHeader from '../../components/layout/BilibiliHeader.vue'
const bannerHeight = 200

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

<style scoped>
.message-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
  }
  .message-panel{
    background-color: #d6eaea;
  }
</style>

<!-- milimili 聊天面板主题：只做视觉覆盖，不改任何逻辑 -->
<style lang="scss" src="./milimili-theme.scss"></style>