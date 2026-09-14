<script setup lang="ts" name="MessagePanel">
import SessionList from '../SessionList/index.vue'
import ChatWindow from '../ChatWindow/index.vue'
</script>

<template>
  <div class="message-page">
    <SessionList />
    <ChatWindow />
  </div>
</template>

<style lang="scss" scoped>
.message-page {
  display: flex;
  width: 100%;
  height: calc(100vh - 64px);
  min-height: 520px;
  background: #f4f5f7;
}
</style>