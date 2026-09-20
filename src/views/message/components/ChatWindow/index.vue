<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../../stores/chat'
import MsgBubble from '../MsgBubble.vue'
import MsgInput from '../MsgInput.vue'
import EmptyHint from '../EmptyHint.vue'
import type { ChatMessageVO } from '../../../../services/types.ts'
import { getUserInfo } from '../../../../services/userStorage.ts'
import { formatMsgTime } from '../../../../utils/time'
const chatStore = useChatStore()
const { messages, loading, myUid, currentContact, currentPeerUid } = storeToRefs(chatStore)
import dayjs from 'dayjs'

function shouldShowTime(i: number) {
  const list = messages.value
  if (i === 0) return true
  const cur = dayjs(list[i].createTime)
  const prev = dayjs(list[i - 1].createTime)
  if (!cur.isValid() || !prev.isValid()) return false
  return cur.diff(prev, 'minute') >= 5
}
async function onSend(text: string) {
  await chatStore.sendText(text)
}

//获取头像，跟据uid获取到对应的头像！！！
function avatarOf(m:ChatMessageVO){
const me = getUserInfo()
if (m.fromUid === me?.uid) return me?.avatar || ''
  return currentContact.value?.peerAvatar || ''
}
</script>

<template>
  <section class="chat-window">
    <EmptyHint v-if="currentPeerUid == null && currentContact == null" />

    <template v-else>
      <header class="chat-header">
        {{ currentContact?.peerNickname || `用户${currentPeerUid}` }}
      </header>

      <div class="chat-body">
        <div v-if="loading" class="loading">加载中...</div>
        <!-- <template v-else>
          <div v-if="!messages.length" class="empty-msg">发一条消息开始聊天吧</div>
          
          <MsgBubble
            v-for="m in messages"
            :key="m.msgId"
            :content="m.content || ''"
            :mine="m.fromUid === myUid"
            :avatar="avatarOf(m)"
          />
        </template> -->
        <template v-for="(m, i) in messages" :key="m.msgId">
  <div v-if="shouldShowTime(i)" class="time-label">
    {{ formatMsgTime(m.createTime) }}
  </div>
  <MsgBubble
    :content="m.content || ''"
    :mine="m.fromUid === myUid"
    :avatar="avatarOf(m)"
  />
</template>
      </div>

      <MsgInput @send="onSend" />
    </template>
  </section>
</template>

<style lang="scss" scoped>
.chat-window {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f4f5f7;
}
.chat-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e3e5e7;
  font-size: 15px;
  font-weight: 600;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
.loading,
.empty-msg {
  padding: 24px;
  text-align: center;
  color: #9499a0;
  font-size: 13px;
}
.time-label {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin: 16px 0 10px;
}
</style>