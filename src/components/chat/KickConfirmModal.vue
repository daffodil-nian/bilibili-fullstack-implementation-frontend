<!--
  KickConfirmModal.vue · 移出群成员确认弹窗
  ------------------------------------------------------------
  用法（GroupInfoDrawer.vue）：
    <KickConfirmModal
      :visible="showKick"
      :room-id="roomId"
      :member="kickTarget"
      @close="onKickClose"
      @confirmed="onKickConfirmed"
    />

  接口：POST /api/chat/group/{roomId}/members/remove   body: {"targetUid":19}
-->
<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { post } from '../../services/request'
import type { GroupMemberVO } from '../../services/types.ts'

// 移出成员确认弹窗
const showKick = ref(false)
const kickTarget = ref<GroupMemberVO | null>(null)
const props = defineProps<{
  visible: boolean
  roomId?: number | null
  /** 要移出的成员 */
  member?: Pick<GroupMemberVO, 'uid' | 'name'> | null
}>()

const emit = defineEmits<{
  close: []
  confirmed: [uid: number]
}>()

const submitting = ref(false)

async function confirm() {
  if (!props.roomId || !props.member?.uid || submitting.value) return
  submitting.value = true
  try {
    await post(`/api/chat/group/${props.roomId}/members/${props.member.uid}/remove`, {})
    message.success('已移出群聊')
    emit('confirmed', props.member.uid)
    emit('close')
  } catch {
    // 请求层已提示（后端返回的 msg 会显示出来）
  } finally {
    submitting.value = false
  }
}

function close() {
  if (submitting.value) return
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="kick-mask" @click.self="close">
      <div class="kick-box">
        <div class="kick-hd">
          <span class="t">移出群成员</span>
          <button type="button" class="x" @click="close">×</button>
        </div>

        <div class="kick-bd">
          <div class="icon">!</div>
          <div class="txt">
            <div class="title">确定把「{{ member?.name || '该成员' }}」移出群聊？</div>
            <div class="desc">
              移出后他将无法看到和发送该群消息，<br />
              需要重新邀请才能加入。
            </div>
          </div>
        </div>

        <div class="kick-ft">
          <button type="button" class="btn" @click="close">取消</button>
          <button type="button" class="btn danger" :disabled="submitting" @click="confirm">
            {{ submitting ? '移出中...' : '移出群聊' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.kick-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(24, 25, 28, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kick-box {
  width: 420px;
  max-width: calc(100vw - 40px);
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

/* ---- 标题 ---- */
.kick-hd {
  display: flex;
  align-items: center;
  padding: 16px 20px 0;
}
.kick-hd .t {
  font-size: 15px;
  font-weight: 700;
  color: #18191c;
}
.kick-hd .x {
  margin-left: auto;
  border: none;
  background: none;
  font-size: 20px;
  line-height: 1;
  color: #9499a0;
  cursor: pointer;
  padding: 0;
}
.kick-hd .x:hover {
  color: #18191c;
}

/* ---- 内容 ---- */
.kick-bd {
  display: flex;
  gap: 14px;
  padding: 16px 20px 22px;
}
.kick-bd .icon {
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 50%;
  background: #fff2f0;
  color: #f04b5a;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kick-bd .title {
  font-size: 15px;
  font-weight: 600;
  color: #18191c;
  line-height: 1.5;
}
.kick-bd .desc {
  margin-top: 8px;
  font-size: 12px;
  color: #9499a0;
  line-height: 1.75;
}

/* ---- 底部 ---- */
.kick-ft {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px 16px;
  border-top: 1px solid #efeff2;
}

.btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #e3e5e7;
  background: #fff;
  color: #61666d;
  transition: all 0.15s;
}
.btn:hover {
  border-color: #fb7299;
  color: #fb7299;
}

.btn.danger {
  background: #f04b5a;
  border-color: #f04b5a;
  color: #fff;
}
.btn.danger:hover:not(:disabled) {
  background: #d93a49;
  border-color: #d93a49;
  color: #fff;
}
.btn.danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>