<script setup lang="ts">
import { ref, watch } from 'vue'

import EmoticonPanel from '../../../components/emoticon/EmoticonPanel.vue'
import CustomEmoticonPanel from '../../../components/emoticon/CustomEmoticonPanel.vue'

const props = withDefaults(
  defineProps<{
    /** true = 不能发言（已退群 / 被移出 / 群已解散） */
    disabled?: boolean
    /** 不能发言时的提示文案 */
    disabledText?: string
  }>(),
  {
    disabled: false,
    disabledText: '你已不在该群聊中，无法发送消息',
  }
)

const showCustom = ref(false)
const emit = defineEmits<{ send: [content: string] }>()
const text = ref('')
const showEmoji = ref(false)

function submit() {
  if (props.disabled) return
  const v = text.value.trim()
  if (!v) return
  emit('send', v)
  text.value = ''
}

function onPickEmoji(code: string) {
  if (props.disabled) return
  text.value += code
  // 可选：showEmoji.value = false
}

function onPickCustom(item: { code: string; url: string }) {
  if (props.disabled) return
  if (!item.url) return
  emit('send', item.url)
  showCustom.value = false
}

// 一旦被禁用，收起所有弹层
watch(
  () => props.disabled,
  (v) => {
    if (v) {
      showEmoji.value = false
      showCustom.value = false
    }
  }
)
</script>

<template>
  <div class="msg-input">
    <!-- ===== 不可发言：整块换成提示条 ===== -->
    <div v-if="disabled" class="msg-blocked">
      <span class="lock">🔒</span>
      <span class="txt">{{ disabledText }}</span>
    </div>

    <!-- ===== 正常输入 ===== -->
    <template v-else>
      <div class="toolbar">
        <button type="button" class="tool-btn" title="图片">🖼</button>
        <!-- 相对定位容器：面板相对这个按钮往上弹 -->
        <div class="emoji-wrap">
          <button type="button" class="tool-btn" title="自定义表情" @click="showCustom = !showCustom">
            +
          </button>
          <div v-if="showCustom" class="emoji-popup">
            <CustomEmoticonPanel @pick="onPickCustom" />
          </div>
          <button type="button" class="tool-btn" title="表情" @click="showEmoji = !showEmoji">
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
        <button type="button" class="send-btn" :class="{ active: text.trim() }" @click="submit">
          发送
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.msg-input {
  display: flex;
  flex-direction: column; /* 先工具栏，再输入行 */
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
  border: 2px solid #e3e5e7;
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
  background: #fb7299;
  color: #fff;
  cursor: pointer;
}

/* ★ 禁用时的提示条：高度和原来输入区接近，避免布局跳动 */
.msg-blocked {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 92px;
  border: 1px dashed #e3e5e7;
  border-radius: 6px;
  background: #fafafb;
  color: #9499a0;
  font-size: 13px;
}
.msg-blocked .lock {
  font-size: 16px;
}
</style>
