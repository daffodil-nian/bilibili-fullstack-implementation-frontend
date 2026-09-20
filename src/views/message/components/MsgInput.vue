<script setup lang="ts">
import { ref } from 'vue'

import EmoticonPanel from '../../../components/emoticon/EmoticonPanel.vue'
const emit = defineEmits<{ send: [content: string] }>()
const text = ref('')
const showEmoji = ref(false)
function submit() {
  const v = text.value.trim()
  if (!v) return
  emit('send', v)
  text.value = ''
}
function onPickEmoji(code: string) {
  text.value += code
  // 可选：showEmoji.value = false
}
</script>

<template>
  <div class="msg-input">
      <div class="toolbar">
      <button type="button" class="tool-btn" title="图片">🖼</button>
      <!-- 相对定位容器：面板相对这个按钮往上弹 -->
      <div class="emoji-wrap">
        <button
          type="button"
          class="tool-btn"
          title="表情"
          @click="showEmoji = !showEmoji"
        >
          😊
        </button>
        <!-- 点开后在上方显示小黄脸 -->
        <div v-if="showEmoji" class="emoji-popup">
          <EmoticonPanel @pick="onPickEmoji" />
        </div>
      </div>
    </div>
    <div class="input-row">
      <textarea
        v-model="text"
        rows="3"
        placeholder="请输入消息内容"
        @keydown.enter.exact.prevent="submit"
      />
      <button type="button" class="send-btn" @click="submit">发送</button>
    </div>
  </div>
</template>

<style scoped>
.msg-input {
  display: flex;
  flex-direction: column;   /* 先工具栏，再输入行 */
  gap: 8px;
  padding: 12px 16px;
  background: #f6f7f8;
  border-top: 1px solid #e3e5e7;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}
.tool-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
/* ★ 关键：相对这个包定位 */
.emoji-wrap {
  position: relative;
}
/* ★ 关键：面板贴在按钮上方 */
.emoji-popup {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px); /* 在按钮上方，留 8px 缝 */
  z-index: 20;
}
.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
textarea {
  flex: 1;
  resize: none;
  border: 1px solid #e3e5e7;
  background: #f6f7f8;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  outline: none;
}
.send-btn {
  height: 36px;
  padding: 0 16px;
  border: 2px  solid #e3e5e7;
  border-radius: 6px;
  background: #fff;
  color: #000000;
  cursor: pointer;
}
.send-btn.active {
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: #00aeec;
  color: #fff;
  cursor: pointer;
}
</style>