<script setup lang="ts">
import { ref ,computed} from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../../stores/chat'
import MsgBubble from '../MsgBubble.vue'
import MsgInput from '../MsgInput.vue'
import EmptyHint from '../EmptyHint.vue'
import GroupInfoDrawer from '../../../../components/chat/GroupInfoDrawer.vue'
import SystemTip from '../../../../components/chat/SystemTip.vue'
import GroupInviteCard from '../GroupInviteCard.vue'
import type { ChatMessageVO } from '../../../../services/types.ts'
import { getUserInfo } from '../../../../services/userStorage.ts'
import { formatMsgTime } from '../../../../utils/time'
import dayjs from 'dayjs'

const chatStore = useChatStore()
const { messages, loading, myUid, currentContact, currentPeerUid } = storeToRefs(chatStore)

// 聊天信息抽屉开关
const showInfo = ref(false)
/** 群被退出/解散后：关闭抽屉 + 刷新会话列表 + 清空右侧 */
async function onGroupUpdated() {
  showInfo.value = false
  await chatStore.handleRoomRemoved(currentContact.value?.roomId)
}

/** 点群名 / 点 ⋯ 打开聊天信息（仅群聊） */
function openInfo() {
  if (currentContact.value?.roomType === 1) showInfo.value = true
}

function shouldShowTime(i: number) {
  const list = messages.value
  if (i === 0) return true
  const cur = dayjs(list[i].createTime)
  const prev = dayjs(list[i - 1].createTime)
  if (!cur.isValid() || !prev.isValid()) return false
  return cur.diff(prev, 'minute') >= 5
}
async function onSend(text: string) {
  if (!canSend.value) return
  await chatStore.sendText(text)
}

function avatarOf(m: ChatMessageVO) {
  const me = getUserInfo()
  if (m.fromUid === me?.uid) return me?.avatar || ''
  // return currentContact.value?.avatar || ''
return m.fromAvatar || ''   // 用消息上的发送者头像，不要用群头像
}

//回去改
const canSend = computed(() => chatStore.canSendInRoom(currentContact.value?.roomId))

</script>

<template>
  <section class="chat-window">
    <EmptyHint v-if="currentContact == null && currentPeerUid == null" />

    <template v-else>
      <header class="chat-header">
        <span class="chat-title" @click="openInfo">
          {{ currentContact?.name || (currentContact?.roomType === 1 ? '群聊' : `用户${currentPeerUid}`) }}
        </span>
        <span class='more-btn' @click="openInfo">⋯</span>
      </header>

      <div class="chat-body">
        <div v-if="loading" class="loading">加载中...</div>
        <template v-for="(m, i) in messages" :key="m.msgId">
          <div v-if="shouldShowTime(i)" class="time-label">
            {{ formatMsgTime(m.createTime) }}
          </div>
          <!-- 系统消息（type=100）：居中灰字，无头像 -->
          <SystemTip v-if="m.type === 4 || m.type === 100" :content="m.content || ''" />

          <!-- 群邀请卡片（type=101）：带同意/拒绝按钮 -->
          <GroupInviteCard
            v-else-if="m.type === 101"
            :msg-id="m.msgId"
            :content="m.content || ''"
            :mine="m.fromUid === myUid"
          />

          <!-- 普通消息：气泡 -->
          <MsgBubble
            v-else
            :content="m.content || ''"
            :mine="m.fromUid === myUid"
            :avatar="avatarOf(m)"
          />
        </template>
      </div>

      <MsgInput
        :disabled="!canSend"
        :disabled-text="currentContact?.roomType === 1
          ? '你已不在该群聊中，无法发送消息'
          : '暂时无法发送消息'"
        @send="onSend"
      />

      <GroupInfoDrawer
        :visible="showInfo"
        :room-id="currentContact?.roomId"
        v-if="currentContact?.roomType === 1"
        @close="showInfo = false"
          @updated="onGroupUpdated"
      />
    </template>
  </section>
</template>

<style lang="scss" scoped>
.chat-window {
  position: relative;
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
.chat-title {
  cursor: pointer;
}
.chat-title:hover {
  color: #FB7299;
}

.more-btn {
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FBD6E2;
  border-radius: 5px;
  background: #FFF5F8;
  color: #FB7299;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

</style>