<!--
  GroupInviteCard.vue · 群邀请卡片（type = 101）
  ------------------------------------------------------------
  用法（ChatWindow/index.vue）：
    <GroupInviteCard
      v-else-if="m.type === 101"
      :msg-id="m.msgId"
      :content="m.content || ''"
      :mine="m.fromUid === myUid"
    />

  两种身份，两种表现：
    我发出的（mine=true）   → 右对齐，「你邀请对方加入群聊」，等待对方确认，无按钮
    别人发的（mine=false）  → 左对齐，「XX 邀请你加入群聊」，带同意/拒绝按钮
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { post } from '../../../services/request'

const props = defineProps<{
  msgId: number
  content: string
  /** 这条卡片是不是我发出的 */
  mine?: boolean
}>()

type State = 'pending' | 'accepted' | 'refused' | 'invalid'

const state = ref<State>('pending')
const submitting = ref(false)

const isMine = computed(() => props.mine === true)

/** 解析后端写进 content 的 JSON */
const payload = computed(() => {
  try {
    const o = JSON.parse(props.content || '{}')
    return {
      roomId: Number(o.roomId) || 0,
      groupName: String(o.groupName || '群聊'),
      inviterName: String(o.inviterName || ''),
      targetUid: Number(o.targetUid) || 0,
      memberCount: Number(o.memberCount) || 0,
      result: String(o.result || 'pending'),
    }
  } catch {
    return {
      roomId: 0,
      groupName: '群聊',
      inviterName: '',
      targetUid: 0,
      memberCount: 0,
      result: 'pending',
    }
  }
})

/** 后端已写过 result 时优先用它（刷新后仍显示正确状态） */
const displayState = computed<State>(() => {
  if (state.value !== 'pending') return state.value
  if (payload.value.result === 'accepted') return 'accepted'
  if (payload.value.result === 'refused') return 'refused'
  return 'pending'
})

function firstChar(s: string) {
  return (s || '群').slice(0, 1)
}

async function act(type: 'accept' | 'refuse') {
  if (displayState.value !== 'pending' || submitting.value) return
  const roomId = payload.value.roomId
  if (!roomId) {
    state.value = 'invalid'
    return
  }
  submitting.value = true
  try {
    await post(
      `/api/chat/group/${roomId}/invite/${type}?msgId=${props.msgId}`,
      {},
    )
    state.value = type === 'accept' ? 'accepted' : 'refused'
    message.success(type === 'accept' ? '已加入群聊' : '已拒绝邀请')
  } catch {
    // 请求层已提示（例如接口还没实现会 404）
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="gi-row" :class="isMine ? 'is-right' : 'is-left'">
    <div class="gi-card" :class="{ done: displayState !== 'pending' }">
      <!-- 群资料 -->
      <div class="card-hd">
        <div class="g-ava">{{ firstChar(payload.groupName) }}</div>
        <div class="g-info">
          <div class="g-name">{{ payload.groupName }}</div>
          <div class="g-sub">群聊邀请</div>
        </div>
      </div>

      <!-- ============ 我发出的：无按钮 ============ -->
      <template v-if="isMine">
        <div class="card-bd">你邀请对方加入群聊</div>
        <div class="state" :class="displayState">
          <span class="dot"></span>
          <template v-if="displayState === 'pending'">等待对方确认</template>
          <template v-else-if="displayState === 'accepted'">对方已加入群聊</template>
          <template v-else-if="displayState === 'refused'">对方拒绝了邀请</template>
          <template v-else>邀请已失效</template>
        </div>
      </template>

      <!-- ============ 别人发给我的 ============ -->
      <template v-else>
        <template v-if="displayState === 'pending'">
          <div class="card-bd">
            <b>{{ payload.inviterName || '群成员' }}</b> 邀请你加入群聊
          </div>
          <div class="card-ft">
            <button class="btn" :disabled="submitting" @click="act('refuse')">拒绝</button>
            <button class="btn primary" :disabled="submitting" @click="act('accept')">同意加入</button>
          </div>
        </template>

        <div v-else class="state" :class="displayState">
          <span class="dot"></span>
          <template v-if="displayState === 'accepted'">你已加入该群聊</template>
          <template v-else-if="displayState === 'refused'">你已拒绝该邀请</template>
          <template v-else>邀请已失效</template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.gi-row {
  display: flex;
  margin: 10px 16px;
}
.gi-row.is-left {
  justify-content: flex-start;
}
.gi-row.is-right {
  justify-content: flex-end;
}

.gi-card {
  width: 300px;
  max-width: 78%;
  border: 2px solid #fbd6e2;
  border-radius: 8px;
  background: #fff;
  box-shadow: 3px 3px 0 #fbe7ee;
  overflow: hidden;
}

.gi-card.done {
  border-color: #efeff2;
  box-shadow: none;
  opacity: 0.78;
}
.gi-card.done .card-hd {
  background: #fafafc;
}

.card-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff5f8;
}

.g-ava {
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #ffe3ec, #ffbbcf);
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.g-info {
  min-width: 0;
}
.g-name {
  font-size: 14px;
  font-weight: 700;
  color: #18191c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.g-sub {
  font-size: 11px;
  color: #9499a0;
  margin-top: 2px;
}

.card-bd {
  padding: 10px 14px;
  font-size: 12px;
  color: #61666d;
  line-height: 1.7;
}
.card-bd b {
  color: #18191c;
}

.card-ft {
  display: flex;
  gap: 8px;
  padding: 0 14px 12px;
}

.btn {
  flex: 1;
  height: 32px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  border: 2px solid #e3e5e7;
  background: #fff;
  color: #61666d;
  transition: all 0.15s;
}
.btn:hover:not(:disabled) {
  border-color: #fb7299;
  color: #fb7299;
}
.btn.primary {
  background: #fb7299;
  border-color: #fb7299;
  color: #fff;
}
.btn.primary:hover:not(:disabled) {
  background: #e8588a;
  border-color: #e8588a;
  color: #fff;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 12px;
  color: #9499a0;
}
.state .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c9ccd0;
}
.state.accepted {
  color: #3ba55d;
}
.state.accepted .dot {
  background: #3ba55d;
}
</style>
