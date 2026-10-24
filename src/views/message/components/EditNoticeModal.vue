<!--
  EditNoticeModal.vue · 编辑群公告
  ------------------------------------------------------------
  用法（GroupInfoDrawer.vue）：
    <EditNoticeModal
      :visible="showNotice"
      :room-id="roomId"
      :notice="info?.notice"
      @close="showNotice = false"
      @saved="onNoticeSaved"
    />

  接口：PUT /api/chat/group/{roomId}/notice   body: {"notice":"..."}
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { put } from '../../../services/request'

const props = defineProps<{
  visible: boolean
  roomId?: number | null
  /** 当前公告内容，用来回显 */
  notice?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: [notice: string]
}>()

const MAX = 255

const draft = ref('')
const submitting = ref(false)

const len = computed(() => draft.value.length)
const changed = computed(() => draft.value.trim() !== (props.notice || '').trim())
const canSave = computed(() => changed.value && len.value <= MAX && !submitting.value)
const nearLimit = computed(() => len.value > MAX - 30)

// 每次打开都回显当前公告
watch(
  () => [props.visible, props.notice],
  ([v]) => {
    if (v) draft.value = props.notice || ''
  },
  { immediate: true }
)

async function save() {
  if (!canSave.value || !props.roomId) return
  submitting.value = true
  try {
    const text = draft.value.trim()
    await put(`/api/chat/group/${props.roomId}/notice`, { notice: text })
    message.success('群公告已更新')
    emit('saved', text)
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
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="notice-mask" @click.self="close">
      <div class="notice-box">
        <div class="notice-hd">
          <span class="t">编辑群公告</span>
          <button type="button" class="x" @click="close">✕</button>
        </div>

        <div class="notice-bd">
          <textarea
            v-model="draft"
            :maxlength="MAX"
            placeholder="介绍一下这个群吧，比如活动时间、群规…"
          />

          <div class="notice-tip">
            <span>群成员都能看到这条公告</span>
            <span class="cnt" :class="{ near: nearLimit }">
              <b>{{ len }}</b> / {{ MAX }}
            </span>
          </div>
        </div>

        <div class="notice-ft">
          <button type="button" class="btn" @click="close">取消</button>
          <button type="button" class="btn primary" :disabled="!canSave" @click="save">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
$pink: #fb7299;
$pink-deep: #e8588a;
$line: #e3e5e7;
$line2: #efeff2;
$t1: #18191c;
$t2: #61666d;
$t3: #9499a0;
$t4: #c9ccd0;

.notice-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(24, 25, 28, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-box {
  width: 480px;
  max-width: calc(100vw - 40px);
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

.notice-hd {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid $line2;
  .t {
    font-size: 15px;
    font-weight: 700;
    color: $t1;
  }
  .x {
    margin-left: auto;
    border: none;
    background: none;
    font-size: 18px;
    line-height: 1;
    color: $t3;
    cursor: pointer;
  }
  .x:hover {
    color: $t1;
  }
}

.notice-bd {
  padding: 14px 16px 6px;

  textarea {
    width: 100%;
    height: 112px;
    resize: none;
    border: 2px solid $line;
    border-radius: 6px;
    background: #f7f7f9;
    padding: 9px 11px;
    font-size: 13px;
    line-height: 1.7;
    color: $t1;
    font-family: inherit;
    outline: none;
    transition: all 0.15s;

    &:focus {
      border-color: #fbd6e2;
      background: #fff;
    }
    &::placeholder {
      color: $t4;
    }
  }
}

.notice-tip {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: $t3;

  .cnt {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    b {
      color: $pink;
      font-weight: 600;
    }
  }
  .cnt.near b {
    color: #e8588a;
  }
}

.notice-ft {
  padding: 12px 16px 14px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid $line2;
}

.btn {
  height: 32px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 13px;
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
