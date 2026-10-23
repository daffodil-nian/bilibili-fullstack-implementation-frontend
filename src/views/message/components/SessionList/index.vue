<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '../../../../stores/chat'
import { createChatGroup, listFans } from '../../../../services/api'
import { getUserInfo } from '../../../../services/userStorage'
import type { UserSimpleVO } from '../../../../services/types'

const chatStore = useChatStore()
const { contacts, currentRoomId } = storeToRefs(chatStore)

const showCreate = ref(false)
const groupName = ref('')
const fans = ref<UserSimpleVO[]>([])
const selected = ref<number[]>([])
const loadingFans = ref(false)

async function loadFans() {
  const me = getUserInfo()?.uid
  if (me == null) return
  loadingFans.value = true
  try {
    // 拉「我的粉丝」——只能从这些人里选
    const res = await listFans(me, 1, 100)
    fans.value = res.data ?? []
  } finally {
    loadingFans.value = false
  }
}

function openCreate() {
  showCreate.value = true
  groupName.value = ''
  selected.value = []
  loadFans()
}

function closeCreate() {
  showCreate.value = false
}

function toggle(uid: number) {
  const i = selected.value.indexOf(uid)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(uid)
}

function isChecked(uid: number) {
  return selected.value.includes(uid)
}

async function submitCreate() {
  if (!groupName.value.trim()) {
    alert('请填写群名称')
    return
  }
  if (selected.value.length < 2) {
    alert('至少选择 2 个粉丝（加上你一共至少 3 人）')
    return
  }
  const res = await createChatGroup({
    name: groupName.value.trim(),
    memberUids: [...selected.value],
  })
  if (res.code !== 0 && res.code !== 200) {
    alert(res.msg || '建群失败')
    return
  }
  showCreate.value = false
  await chatStore.fetchContacts()
  if (res.data) await chatStore.openByRoomId(res.data)
}

/**
 * 会话列表预览文案
 * 卡片消息的 content 是一段 JSON，不能直接显示，否则会出现
 * {"roomId":23,"groupName":"..."} 这种原始内容
 */
function previewOf(c: { lastContent?: string | null }) {
  const raw = (c.lastContent || '').trim()
  if (!raw) return ''
  if (raw.startsWith('{')) {
    try {
      const o = JSON.parse(raw)
      if (o && o.groupName) return `[群邀请] ${o.groupName}`
    } catch {
      /* 不是 JSON，继续走下面 */
    }
    return '[卡片消息]'
  }
  return raw
}

function onSelect(roomId?: number) {
  if (roomId == null) return
  chatStore.openByRoomId(roomId)
}
</script>

<template>
  <aside class="session-list">
    <!-- 标题行 + 建群按钮 -->
    <div class="session-title">
      <span>消息中心</span>
      <button type="button" class="create-btn" @click="openCreate">
        ＋
      </button>
    </div>

    <div v-if="!contacts.length" class="session-empty">暂无会话</div>

    <button
      v-for="c in contacts"
      :key="c.roomId"
      type="button"
      class="session-item"
      :class="{ active: c.roomId === currentRoomId }"
      @click="onSelect(c.roomId)"
    >
      <img class="avatar" :src="c.avatar || ''" alt="" />
      <div class="meta">
        <div class="top">
          <span class="name">{{ c.name || (c.roomType === 1 ? '群聊' : `用户${c.peerUid}`) }}</span>
          <span v-if="c.unreadCount" class="badge">{{ c.unreadCount }}</span>
        </div>
        <div class="last">{{ previewOf(c) }}</div>
      </div>
    </button>
  </aside>

  <!-- 居中弹窗：建群 -->
  <Teleport to="body">
    <div v-if="showCreate" class="modal-mask" @click.self="closeCreate">
      <div class="modal-box">
        <div class="modal-header">
          <span>创建群聊</span>
          <button type="button" class="modal-close" @click="closeCreate">×</button>
        </div>

        <div class="modal-body">
          <input
            v-model="groupName"
            class="group-name-input"
            placeholder="请输入群名称"
          />

          <div class="fan-tip">只能选择你的粉丝（至少 2 人）</div>

          <div v-if="loadingFans" class="fan-tip">加载粉丝中...</div>
          <div v-else-if="!fans.length" class="fan-tip">暂无粉丝，无法建群</div>
          <div v-else class="fan-list">
            <label
              v-for="f in fans"
              :key="f.uid"
              class="fan-item"
              :class="{ checked: isChecked(f.uid) }"
            >
              <input
                type="checkbox"
                :checked="isChecked(f.uid)"
                @change="toggle(f.uid)"
              />
              <img :src="f.avatar || ''" class="fan-avatar" alt="" />
              <span class="fan-name">{{ f.nickname || `用户${f.uid}` }}</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="closeCreate">取消</button>
          <button type="button" class="btn-confirm" @click="submitCreate">创建</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.session-list {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e3e5e7;
  overflow-y: auto;
}

/* 标题行 */
.session-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}

/* 建群按钮：有边界的小方块，不是裸文字 */
.create-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #f69;
  background: #fff;
  border: 1px solid #f69;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #fff0f5;
  }
  &:active {
    transform: scale(0.94);
  }
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
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 50%;
  background: #f69;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
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

/* ========== 居中弹窗 ========== */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.modal-box {
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #18191c;
  border-bottom: 1px solid #f1f2f3;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  font-size: 20px;
  color: #9499a0;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background: #f1f2f3;
    color: #18191c;
  }
}

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
}

.group-name-input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
  border: 1px solid #e3e5e7;
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #f69;
  }
}

.fan-tip {
  font-size: 12px;
  color: #9499a0;
  margin-bottom: 8px;
}

.fan-list {
  max-height: 260px;
  overflow-y: auto;
}

.fan-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.12s;

  &:hover {
    background: #f7f8f9;
  }
  &.checked {
    background: #fff0f5;
  }
}

.fan-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e3e5e7;
  object-fit: cover;
}

.fan-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #f1f2f3;
}

.btn-cancel,
.btn-confirm {
  padding: 7px 18px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.btn-cancel {
  background: #fff;
  border-color: #e3e5e7;
  color: #61666d;

  &:hover {
    background: #f1f2f3;
  }
}

.btn-confirm {
  background: #f69;
  color: #fff;

  &:hover {
    background: #e5588a;
  }
  &:active {
    transform: scale(0.97);
  }
}
</style>