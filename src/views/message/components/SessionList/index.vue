<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../../stores/chat'

const chatStore = useChatStore()
const { contacts, currentRoomId } = storeToRefs(chatStore)

function onSelect(roomId?: number) {
  if (roomId == null) return
  chatStore.openByRoomId(roomId)
}
</script>

<template>
  <aside class="session-list">
    <div class="session-title">消息</div>

    <div v-if="!contacts.length" class="session-empty">暂无会话</div>

    <button
      v-for="c in contacts"
      :key="c.roomId"
      type="button"
      class="session-item"
      :class="{ active: c.roomId === currentRoomId }"
      @click="onSelect(c.roomId)"
    >
      <img class="avatar" :src="c.peerAvatar || ''" alt="" />
      <div class="meta">
        <div class="top">
          <span class="name">{{ c.peerNickname || `用户${c.peerUid}` }}</span>
          <span v-if="c.unreadCount" class="badge">{{ c.unreadCount }}</span>
        </div>
        <div class="last">{{ c.lastContent || '' }}</div>
      </div>
    </button>
  </aside>
</template>

<style lang="scss" scoped>
.session-list {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e3e5e7;
  overflow-y: auto;
}
.session-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}
.session-empty {
  padding: 24px 16px;
  color: #9499a0;
  font-size: 13px;
}
.session-item {
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  &:hover,
  &.active {
    background: #f1f2f3;
  }
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #e3e5e7;
}
.meta {
  min-width: 0;
  flex: 1;
}
.top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.name {
  font-size: 14px;
  color: #18191c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.badge {
  min-width: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: #f69;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}
.last {
  margin-top: 4px;
  font-size: 12px;
  color: #9499a0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>