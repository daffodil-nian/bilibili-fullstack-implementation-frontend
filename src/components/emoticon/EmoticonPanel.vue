<!--
  官方小黄脸面板（对齐 Teriteri）：
  - 资源：public/emoji/*.png + src/assets/json/emoji.json
  - 点选后抛出短码，如 [微笑]；消息里存短码，展示时再换成图
-->
<script setup lang="ts">
import emojiList from '../../assets/json/emoji.json'

export type EmojiItem = {
  name: string
  url: string
}

const emit = defineEmits<{
  /** 选中的短码，例如 "[微笑]" */
  pick: [code: string]
}>()

const items = emojiList as EmojiItem[]

function onPick(item: EmojiItem) {
  if (!item?.name) return
  emit('pick', item.name)
}
</script>

<template>
  <div class="emoji-panel" role="listbox" aria-label="小黄脸表情">
    <div class="emoji-panel__title">小黄脸</div>
    <div class="emoji-panel__grid">
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        class="emoji-panel__item"
        :title="item.name"
        role="option"
        @click="onPick(item)"
      >
        <img class="emoji-panel__img" :src="item.url" :alt="item.name" draggable="false" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.emoji-panel {
  width: 320px;
  max-height: 240px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 8px;
  box-sizing: border-box;
  overflow: auto;
}

.emoji-panel__title {
  font-size: 12px;
  color: #9499a0;
  margin-bottom: 6px;
  padding: 0 4px;
}

.emoji-panel__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.emoji-panel__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.emoji-panel__item:hover {
  background: #f1f2f3;
}

.emoji-panel__img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}
</style>
