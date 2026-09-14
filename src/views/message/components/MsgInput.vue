<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ send: [content: string] }>()
const text = ref('')

function submit() {
  const v = text.value.trim()
  if (!v) return
  emit('send', v)
  text.value = ''
}
</script>

<template>
  <div class="msg-input">
    <textarea
      v-model="text"
      rows="3"
      placeholder="发个消息呗"
      @keydown.enter.exact.prevent="submit"
    />
    <button type="button" class="send-btn" @click="submit">发送</button>
  </div>
</template>

<style scoped>
.msg-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e3e5e7;
}
textarea {
  flex: 1;
  resize: none;
  border: 1px solid #e3e5e7;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
}
.send-btn {
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: #00aeec;
  color: #fff;
  cursor: pointer;
}
</style>