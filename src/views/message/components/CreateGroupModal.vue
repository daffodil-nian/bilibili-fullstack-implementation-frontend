<!-- 这个是右上角的三个点的弹窗，可以把我和对方之间的聊天会话置顶，拉入黑名单等操作 -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface MenuItem {
  key: string
  label: string
  desc?: string
  danger?: boolean
}

const props = defineProps<{
  // 当前会话信息，用于判断菜单项状态
  roomId?: number
  isGroup?: boolean
  isPinned?: boolean
  isMuted?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', key: string): void
}>()

const visible = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// 菜单项定义——群聊和单聊不一样
const menuItems = ref<MenuItem[]>([])

function buildMenu() {
  if (props.isGroup) {
    // 群聊菜单
    menuItems.value = [
      { key: 'pin', label: props.isPinned ? '取消置顶' : '置顶聊天' },
      { key: 'mute', label: props.isMuted ? '关闭免打扰' : '开启免打扰' },
      { key: 'quit', label: '退出群聊', danger: true },
      { key: 'dissolve', label: '撤回群聊', danger: true }, // 仅群主可见
    ]
  } else {
    // 单聊菜单（图上那个）
    menuItems.value = [
      { key: 'pin', label: '置顶聊天' },
      { key: 'mute', label: '开启免打扰' },
      { key: 'block', label: '加入黑名单' },
      { key: 'report', label: '举报该用户' },
      { key: 'no_push', label: '不接收推送', desc: '通知正常接收' },
    ]
  }
}

function toggle() {
  visible.value = !visible.value
  if (visible.value) buildMenu()
}

function onSelect(key: string) {
  visible.value = false
  emit('action', key)
}

// 点击外部关闭
function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    visible.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="menuRef" class="header-menu">
    <button type="button" class="dots-btn" @click.stop="toggle">
      <span></span><span></span><span></span>
    </button>

    <div v-if="visible" class="menu-popup" @click.stop>
      <button
        v-for="item in menuItems"
        :key="item.key"
        type="button"
        class="menu-item"
        :class="{ danger: item.danger }"
        @click="onSelect(item.key)"
      >
        <span class="label">{{ item.label }}</span>
        <span v-if="item.desc" class="desc">{{ item.desc }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-menu {
  position: relative;
}

.dots-btn {
  width: 32px;
  height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background: #f1f2f3;
  }

  span {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #61666d;
  }
}

.menu-popup {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 100;
  min-width: 140px;
  padding: 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
}

.menu-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  color: #18191c;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f1f2f3;
  }

  &.danger {
    color: #f56c6c;
  }

  .desc {
    margin-top: 2px;
    font-size: 11px;
    color: #9499a0;
  }
}
</style>