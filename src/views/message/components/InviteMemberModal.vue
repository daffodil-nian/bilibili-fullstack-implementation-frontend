<!--
  InviteMemberModal.vue · 邀请成员弹窗
  ------------------------------------------------------------
  功能：从「我的粉丝」里勾选，最多 9 人，已在群的人自动置灰。
  放法：src/views/message/components/InviteMemberModal.vue

  用法（在 GroupInfoDrawer.vue 里）：
    <InviteMemberModal
      :visible="showInvite"
      :room-id="roomId!"
      :existing-uids="members.map(m => m.uid)"
      @close="showInvite = false"
      @success="onInvited"
    />

  依赖：GET /api/user/{uid}/fans   （你已经有这个接口，listFans 也在 api.ts 里）
        POST /api/chat/group/{roomId}/members  body:{"uids":[...]}
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { get, post } from '../../../services/request'
import { getUserInfo } from '../../../services/userStorage'

interface FanVO {
  uid: number
  nickname?: string | null
  avatar?: string | null
}

const props = defineProps<{
  visible: boolean
  roomId?: number | null
  /** 已经在群里的人，列表里置灰不可选 */
  existingUids?: number[]
}>()

const emit = defineEmits<{ close: []; success: [] }>()

const MAX = 9

const fans = ref<FanVO[]>([])
const selected = ref<number[]>([])
const loading = ref(false)
const submitting = ref(false)

const myUid = computed(() => getUserInfo()?.uid ?? 0)
const existingSet = computed(() => new Set(props.existingUids ?? []))

const selectable = computed(() => fans.value.filter((f) => !existingSet.value.has(f.uid)))

const canSubmit = computed(() => selected.value.length > 0 && !submitting.value)

/** 载入粉丝 */
async function loadFans() {
  if (!myUid.value) return
  loading.value = true
  try {
    const res = await get(`/api/user/${myUid.value}/fans`, { page: 1, size: 100 })
    const data = res?.data
    // 后端可能返回数组，也可能返回分页对象，两种都兼容
    const list: FanVO[] = Array.isArray(data) ? data : (data?.records ?? data?.list ?? [])
    fans.value = list
  } catch {
    fans.value = []
    message.error('粉丝列表加载失败')
  } finally {
    loading.value = false
  }
}

function toggle(uid: number) {
  if (existingSet.value.has(uid)) return
  const i = selected.value.indexOf(uid)
  if (i >= 0) {
    selected.value.splice(i, 1)
    return
  }
  if (selected.value.length >= MAX) {
    message.warning(`最多只能选 ${MAX} 个`)
    return
  }
  selected.value.push(uid)
}

function isChecked(uid: number) {
  return selected.value.includes(uid)
}

function firstChar(name?: string | null) {
  return (name || '粉').slice(0, 1)
}

async function submit() {
  if (!props.roomId || !selected.value.length) return
  submitting.value = true
  try {
    await post(`/api/chat/group/${props.roomId}/members`, { uids: [...selected.value] })
    message.success(`已邀请 ${selected.value.length} 人`)
    selected.value = []
    emit('success')
    emit('close')
  } catch {
    // 请求层已提示
  } finally {
    submitting.value = false
  }
}

function close() {
  if (submitting.value) return
  emit('close')
}

// 每次打开都重新拉粉丝 + 清空选择
watch(
  () => props.visible,
  (v) => {
    if (v) {
      selected.value = []
      loadFans()
    }
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="invite-mask" @click.self="close">
      <div class="invite-box">
        <!-- 标题 -->
        <div class="invite-hd">
          <span class="t">邀请成员</span>
          <button type="button" class="x" @click="close">×</button>
        </div>

        <!-- 内容 -->
        <div class="invite-bd">
          <div class="invite-tip">
            只能邀请你的粉丝，最多 <b>{{ MAX }}</b> 人
            <span class="count">已选 <b>{{ selected.length }}</b> / {{ MAX }}</span>
          </div>

          <div v-if="loading" class="invite-empty">加载粉丝中...</div>

          <div v-else-if="!fans.length" class="invite-empty">
            你还没有粉丝，无法邀请
          </div>

          <div v-else class="invite-grid">
            <div
              v-for="f in fans"
              :key="f.uid"
              class="invite-fan"
              :class="{
                on: isChecked(f.uid),
                disabled: existingSet.has(f.uid),
              }"
              @click="toggle(f.uid)"
            >
              <span v-if="!existingSet.has(f.uid)" class="ck">
                <template v-if="isChecked(f.uid)">✓</template>
              </span>
              <span v-else class="badge">已在群</span>

              <img v-if="f.avatar" class="ava" :src="f.avatar" alt="" />
              <span v-else class="ava">{{ firstChar(f.nickname) }}</span>

              <span class="nm">{{ f.nickname || `用户${f.uid}` }}</span>
            </div>
          </div>
        </div>

        <!-- 底部 -->
        <div class="invite-ft">
          <span class="left">
            群成员 {{ existingUids?.length ?? 0 }} 人
            <template v-if="selected.length">
              ，邀请后最多 {{ (existingUids?.length ?? 0) + selected.length }} 人
            </template>
          </span>
          <button type="button" class="btn" @click="close">取消</button>
          <button
            type="button"
            class="btn primary"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitting ? '邀请中...' : `邀请 (${selected.length})` }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
$pink: #fb7299;
$pink-deep: #e8588a;
$pink-soft: #fff5f8;
$line: #e3e5e7;
$line2: #efeff2;
$t1: #18191c;
$t2: #61666d;
$t3: #9499a0;
$t4: #c9ccd0;

.invite-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(24, 25, 28, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-box {
  width: 520px;
  max-width: calc(100vw - 40px);
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

.invite-hd {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid $line2;
  .t {
    font-size: 16px;
    font-weight: 700;
    color: $t1;
  }
  .x {
    margin-left: auto;
    border: none;
    background: none;
    font-size: 20px;
    line-height: 1;
    color: $t3;
    cursor: pointer;
  }
  .x:hover {
    color: $t1;
  }
}

.invite-bd {
  padding: 16px 20px 8px;
  max-height: 420px;
  overflow-y: auto;
}

.invite-tip {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $t3;
  margin-bottom: 12px;
  b {
    color: $pink;
    font-weight: 600;
    margin: 0 2px;
  }
  .count {
    margin-left: auto;
    font-size: 12px;
    color: $t2;
    b {
      font-size: 14px;
      font-weight: 700;
    }
  }
}

.invite-empty {
  padding: 40px 0;
  text-align: center;
  font-size: 13px;
  color: $t3;
}

.invite-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.invite-fan {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    background: #fafafc;
  }

  .ava {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    background: linear-gradient(135deg, #ffe3ec, #ffbbcf);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }

  .nm {
    font-size: 12px;
    color: $t2;
    max-width: 96px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ck {
    position: absolute;
    right: 6px;
    top: 6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid $line;
    background: #fff;
    color: #fff;
    font-size: 11px;
    line-height: 14px;
    text-align: center;
  }

  .badge {
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: 9px;
    line-height: 14px;
    color: #fff;
    background: $t4;
    border-radius: 3px;
    padding: 0 4px;
  }

  /* 选中 */
  &.on {
    background: $pink-soft;
    border-color: $pink;
    .ck {
      background: $pink;
      border-color: $pink;
    }
    .nm {
      color: $pink;
    }
  }

  /* 已在群 */
  &.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.invite-ft {
  padding: 12px 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid $line2;

  .left {
    font-size: 12px;
    color: $t3;
  }
}

.btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid $line;
  background: #fff;
  color: $t2;
  transition: all 0.15s;

  &:hover {
    border-color: $pink;
    color: $pink;
  }

  &.primary {
    background: $pink;
    border-color: $pink;
    color: #fff;
    margin-left: auto;

    &:hover:not(:disabled) {
      background: $pink-deep;
      border-color: $pink-deep;
      color: #fff;
    }

    &:disabled {
      background: #f3f4f6;
      border-color: #f3f4f6;
      color: $t4;
      cursor: not-allowed;
    }
  }
}
</style>