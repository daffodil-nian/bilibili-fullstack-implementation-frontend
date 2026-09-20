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
// .message-page {
//   display: flex;
//   width: 100%;
//   height: calc(100vh - 64px);
//   min-height: 520px;
//   background: #f4f5f7;
// }


// 改成这个样子试试看，
.message-page {
  display: flex;
  width: 1160px;                 /* 固定宽度，别 100% */
  max-width: calc(100% - 48px);  /* 小屏左右各留约 24px */
  height: calc(100vh - 64px - 40px); /* 上下留空，别顶满屏 */
  min-height: 560px;
  margin: 20px auto 24px;        /* 水平居中，露出两侧背景 */
  background: #d6eaea;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}
</style>