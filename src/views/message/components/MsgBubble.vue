<!-- MsgBubble.vue -->
<template>
  <div class="row" :class="mine ? 'mine' : 'peer'">
    <div class="bubble">{{ content }}</div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ content: string; mine: boolean }>()
</script>
<style scoped>
.row { display: flex; margin: 8px 12px; }
.peer { justify-content: flex-start; }
.mine { justify-content: flex-end; }
.bubble {
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
}
.peer .bubble { background: #fff; }
.mine .bubble { background: #00aeec; color: #fff; }
</style>