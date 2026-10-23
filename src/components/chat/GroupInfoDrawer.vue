<!--
  GroupInfoDrawer.vue · 聊天信息抽屉
  ------------------------------------------------------------
  完全自包含：所有接口调用都在本文件内，不需要改 services/api.ts、urls.ts、types.ts。
  只依赖 services/request.ts 的 get / post / put / postForm（不改动它）。

  用法（在 ChatWindow/index.vue 里）：
    <span class="more-btn" @click="showInfo = true">⋯</span>
    <GroupInfoDrawer :visible="showInfo" :room-id="currentContact?.roomId" @close="showInfo = false" />

  后端没接通时自动使用占位数据，方便先看效果。
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { get, post, put, postForm } from '../../services/request'
import { getUserInfo } from '../../services/userStorage'
import defaultAvatar from '../../assets/avatar/default.png'
import InviteMemberModal from '../../views/message/components/InviteMemberModal.vue'

interface GroupInfo {
  roomId: number
  name: string
  avatar?: string | null
  ownerUid: number
  memberCount: number
  notice?: string | null
}
interface GroupMember {
  uid: number
  name: string
  avatar?: string | null
  role: number   // 1 群主 2 管理员 3 成员
  status: number
}

const props = defineProps<{ visible: boolean; roomId?: number | null }>()
const emit = defineEmits<{ close: []; updated: [] }>()

const API = '/api/chat/group'

/* ---------------- 状态 ---------------- */
const info = ref<GroupInfo | null>(null)
const members = ref<GroupMember[]>([])
const loading = ref(false)
const usingDemo = ref(false)
const errorText = ref('')

// 邀请成员弹窗开关
const showInvite = ref(false)

const myUid = computed(() => getUserInfo()?.uid ?? 0)
const me = computed(() => members.value.find(m => m.uid === myUid.value) || null)
const isOwner = computed(() => me.value?.role === 1 || (info.value?.ownerUid === myUid.value))
const canManage = computed(() => isOwner.value || me.value?.role === 2)

/* ---------------- 占位数据（后端未通时） ---------------- */
const DEMO_INFO: GroupInfo = {
  roomId: 1,
  name: '最好的我们',
  avatar: null,
  ownerUid: 1,
  memberCount: 8,
  notice: '每晚十点开门，欢迎来我的小屋一起听歌～',
}
const DEMO_MEMBERS: GroupMember[] = [
  { uid: 1, name: '小豆包', role: 1, status: 1 },
  { uid: 2, name: '阿岚', role: 2, status: 1 },
  { uid: 3, name: '木星电台', role: 3, status: 1 },
  { uid: 4, name: '老陈的猫', role: 3, status: 1 },
  { uid: 5, name: '南屿', role: 3, status: 1 },
  { uid: 6, name: '8bit 阿伟', role: 3, status: 1 },
  { uid: 7, name: '柠檬精', role: 3, status: 1 },
]

/* ---------------- 后端 VO → 前端模型 ---------------- */
/**
 * 后端 GroupInfoVO 的字段是 groupName / groupAvatar / userId，
 * 前端用 name / avatar / ownerUid，这里做一层适配，
 * 以后后端改字段名只需要改这一个函数。
 */
function mapInfo(d: any): GroupInfo {
  return {
    roomId: d.roomId,
    name: d.groupName ?? d.name ?? '',
    avatar: d.groupAvatar ?? d.avatar ?? null,
    ownerUid: d.userId ?? d.ownerUid ?? 0,
    memberCount: d.memberCount ?? 0,
    notice: d.notice ?? null,
  }
}

/* ---------------- 加载 ---------------- */
async function load() {
  if (!props.roomId) return
  loading.value = true
  usingDemo.value = false
  errorText.value = ''

  // allSettled：两个接口互不影响，一个挂了另一个照样显示
  const [infoRes, memberRes] = await Promise.allSettled([
    get(`${API}/${props.roomId}`),
    get(`${API}/${props.roomId}/members`),
  ])

  // ---------- 群资料 ----------
  if (infoRes.status === 'fulfilled' && infoRes.value?.data) {
    info.value = mapInfo(infoRes.value.data)
    console.log('[群信息] 群资料', infoRes.value.data)
  } else {
    info.value = DEMO_INFO
    usingDemo.value = true
    errorText.value =
      infoRes.status === 'rejected'
        ? `群资料：${(infoRes.reason as any)?.message ?? infoRes.reason}`
        : '群资料为空'
    console.warn('[群信息] 群资料失败', infoRes)
  }

  // ---------- 群成员 ----------
  if (memberRes.status === 'fulfilled') {
    const arr = memberRes.value?.data
    // 成功就用真实数据，空数组也不塞假数据
    members.value = Array.isArray(arr) ? arr : []
    console.log('[群信息] 群成员', arr)
  } else {
    members.value = DEMO_MEMBERS
    usingDemo.value = true
    const m = `群成员：${(memberRes.reason as any)?.message ?? memberRes.reason}`
    errorText.value = errorText.value ? `${errorText.value}；${m}` : m
    console.warn('[群信息] 群成员失败', memberRes)
  }

  loading.value = false
}

watch(() => [props.visible, props.roomId], ([v]) => { if (v && props.roomId) load() }, { immediate: true })

/* ---------------- 改群名 ---------------- */
const editing = ref(false)
const nameDraft = ref('')

function startEdit() {
  if (!canManage.value) return
  nameDraft.value = info.value?.name ?? ''
  editing.value = true
}

async function saveName() {
  const v = nameDraft.value.trim()
  if (!v || v === info.value?.name) { editing.value = false; return }
  try {
    await put(`${API}/${props.roomId}/name`, { name: v })
    info.value = { ...(info.value as GroupInfo), name: v }
    // console.log('更新群名称的结果',res)
    // if(res)
    message.success('群名已更新')
    emit('updated')
  } catch { /* 请求层已提示 */ }
  editing.value = false
}

/* ---------------- 换群头像 ---------------- */
const fileInput = ref<HTMLInputElement | null>(null)

async function onPickAvatar(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !canManage.value) return
  try {
    const fd = new FormData()
    // ★ 后端签名：POST /api/chat/group/avatar/update
    //   @RequestParam("roomId") Long roomId  +  @RequestParam("file") MultipartFile
    //   → roomId 必须放进 FormData（不能放路径里）
    fd.append('roomId', String(props.roomId))
    fd.append('file', file)
    const res = await postForm('/api/chat/group/avatar/update', fd)
    info.value = { ...(info.value as GroupInfo), avatar: res.data }
    message.success('群头像已更新')
    emit('updated')
  } catch { /* ignore */ }
}

/* ---------------- 成员操作 ---------------- */
async function onKick(m: GroupMember) {
  if (!canManage.value || m.uid === myUid.value || m.role === 1) return
  if (!window.confirm(`把「${m.name}」移出群聊？`)) return
  try {
    await post(`${API}/${props.roomId}/members/${m.uid}/remove`, {})
    members.value = members.value.filter(x => x.uid !== m.uid)
    message.success('已移出')
  } catch { /* ignore */ }
}

async function onToggleAdmin(m: GroupMember) {
  if (!isOwner.value || m.uid === myUid.value || m.role === 1) return
  const next = m.role === 2 ? 3 : 2
  try {
    await put(`${API}/${props.roomId}/members/${m.uid}/role`, { role: next })
    m.role = next
    message.success(next === 2 ? '已设为管理员' : '已取消管理员')
  } catch { /* ignore */ }
}

/* ---------------- 邀请 ---------------- */
/** 打开邀请弹窗（从我的粉丝里勾选，最多 9 个） */
function onInvite() {
  showInvite.value = true
}

/** 邀请成功后刷新成员列表 */
function onInvited() {
  load()
}

/* ---------------- 退出 / 解散 ---------------- */
async function onQuit() {
  if (!window.confirm('确定退出该群聊？')) return
  try {
    await post(`${API}/${props.roomId}/quit`, {})
    message.success('已退出')
    emit('close'); emit('updated')
  } catch { /* ignore */ }
}

async function onDissolve() {
  if (!window.confirm('解散后不可恢复，确定？')) return
  try {
    await post(`${API}/${props.roomId}/dissolve`, {})
    message.success('群已解散')
    emit('close'); emit('updated')
  } catch { /* ignore */ }
}


</script>

<template>
  <div v-if="visible" class="gi-drawer">
    <div class="gi-hd">
      <span class="t">聊天信息</span>
      <span v-if="usingDemo" class="demo-tag">示例数据</span>
      <span class="x" @click="emit('close')">✕</span>
    </div>

    <div v-if="errorText" class="gi-err">{{ errorText }}</div>

    <div class="gi-body">
      <!-- 群资料 -->
      <div class="gi-group">
        <div class="g-ava" @click="canManage && fileInput?.click()">
          <img :src="info?.avatar || defaultAvatar" alt="" />
          <span v-if="canManage" class="cam">✎</span>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onPickAvatar" />

        <div class="g-info">
          <div v-if="!editing" class="g-name">
            <span class="nm">{{ info?.name || '群聊' }}</span>
            <span v-if="canManage" class="edit" @click="startEdit">修改</span>
          </div>
          <div v-else class="g-edit">
            <input v-model="nameDraft" maxlength="20" @keyup.enter="saveName" @keyup.esc="editing = false" />
            <button class="mini" @click="saveName">保存</button>
            <button class="mini ghost" @click="editing = false">取消</button>
          </div>
          <div class="g-meta">{{ members.length }} 位成员</div>
          <div class="g-id">群号 ROOM-{{ roomId }}</div>
        </div>
      </div>

      <!-- 成员 -->
      <div class="gi-sec">
        <span>群成员</span><span class="n">（{{ members.length }}）</span>
        <span class="act" @click="onInvite">+ 邀请</span>
      </div>
      <div class="gi-grid">
        <div v-for="m in members" :key="m.uid" class="m">
          <div
            class="a"
            :class="{ owner: m.role === 1 }"
            :title="m.role === 1 ? '群主' : m.role === 2 ? '管理员（点击取消）' : '点击设为管理员'"
            @click="onToggleAdmin(m)"
          >
            <img :src="m.avatar || defaultAvatar" alt="" />
            <span v-if="m.role === 1" class="tag">群主</span>
            <span v-else-if="m.role === 2" class="tag admin">管理</span>
          </div>
          <div class="nm">{{ m.name }}</div>
          <span v-if="canManage && m.role !== 1 && m.uid !== myUid" class="kick" @click="onKick(m)">移出</span>
        </div>
        <div class="m invite" @click="onInvite">
          <div class="a">+</div>
          <div class="nm">邀请</div>
        </div>
      </div>

      <!-- 群公告 -->
      <div class="gi-notice">
        <div class="h">群公告</div>
        <div class="c">{{ info?.notice || '暂无公告' }}</div>
      </div>

      <!-- 设置（仅展示） -->
      <div class="gi-settings">
        <div class="set">置顶聊天<span class="sw on"><i></i></span></div>
        <div class="set">消息免打扰<span class="sw"><i></i></span></div>
        <div class="set">查找聊天记录<span class="v">›</span></div>
      </div>
    </div>

    <div class="gi-foot">
      <button v-if="isOwner" class="danger" @click="onDissolve">解散群聊</button>
      <button v-else class="danger" @click="onQuit">退出群聊</button>
    </div>

    <!-- 邀请成员弹窗：从我的粉丝里勾选，最多 9 个 -->
    <InviteMemberModal
      :visible="showInvite"
      :room-id="roomId"
      :existing-uids="members.map(m => m.uid)"
      @close="showInvite = false"
      @success="onInvited"
    />
  </div>
</template>

<style scoped lang="scss">
$pink: #fb7299;
$pink-deep: #e8588a;
$pink-soft: #fff5f8;
$pink-line: #fbd6e2;
$line: #efeff2;
$t1: #18191c;
$t2: #61666d;
$t3: #9499a0;
$t4: #b9bcc2;

.gi-drawer {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 30;
  width: 320px;
  flex: none;
  height: 100%;
  background: #fff;
  border-left: 2px solid $line;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gi-hd {
  height: 56px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 2px solid $line;
  .t { font-weight: 700; font-size: 15px; }
  .demo-tag {
    font-size: 10px; color: $t3; border: 2px solid $line;
    border-radius: 3px; padding: 0 4px;
  }
  .x { margin-left: auto; color: $t3; cursor: pointer; font-size: 18px; }
}

.gi-err {
  margin: 8px 12px 0;
  padding: 6px 10px;
  font-size: 11px;
  line-height: 1.5;
  color: #e8588a;
  background: #fff5f8;
  border: 1px solid #fbd6e2;
  border-radius: 4px;
  word-break: break-all;
}

.gi-body { flex: 1; overflow-y: auto; }

.gi-group {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid $line;
}

.g-ava {
  position: relative;
  width: 64px;
  height: 64px;
  flex: none;
  border: 2px solid $line;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffe3ec, #fff5f8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: $pink;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  overflow: visible;
  img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
  .cam {
    position: absolute; right: -6px; bottom: -6px;
    width: 22px; height: 22px; border-radius: 4px;
    background: $pink; border: 2px solid #fff;
    color: #fff; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
  }
}

.g-info { flex: 1; min-width: 0; }
.g-name {
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .edit {
    flex: none;
    font-size: 11px; font-weight: 400;
    color: $pink; border: 2px solid $pink-line; background: $pink-soft;
    border-radius: 4px; padding: 0 5px; cursor: pointer;
  }
}
.g-edit {
  display: flex;
  gap: 6px;
  align-items: center;
  input {
    flex: 1; min-width: 0; height: 28px;
    border: 2px solid $pink-line; border-radius: 4px;
    padding: 0 8px; font-size: 13px; outline: none;
  }
  .mini {
    flex: none; height: 28px; padding: 0 10px; font-size: 12px;
    border-radius: 4px; border: 2px solid $pink-deep;
    background: $pink; color: #fff; cursor: pointer;
    &.ghost { background: #fff; color: $t2; border-color: $line; }
  }
}
.g-meta { font-size: 12px; color: $t3; margin-top: 4px; }
.g-id { font-size: 12px; color: $t4; margin-top: 2px; }

.gi-sec {
  display: flex;
  align-items: center;
  padding: 12px 16px 6px;
  font-size: 13px;
  color: $t2;
  .n { color: $t3; margin-left: 3px; }
  .act { margin-left: auto; font-size: 12px; color: $pink; cursor: pointer; }
}

.gi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 6px 16px 14px;
}

.m {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  .a {
    position: relative;
    width: 52px; height: 52px;
    border: 2px solid $line;
    border-radius: 6px;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    color: $pink; font-size: 14px; font-weight: 700;
    cursor: pointer;
    img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
    &.owner { border-color: $pink; }
    .tag {
      position: absolute; left: -4px; top: -6px;
      font-size: 9px; background: $pink; color: #fff;
      border-radius: 3px; padding: 0 3px;
      &.admin { background: #00aeec; }
    }
  }
  .nm {
    font-size: 11px; color: $t2;
    max-width: 56px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .kick {
    position: absolute; top: -6px; right: -2px;
    font-size: 9px; color: $pink-deep; background: $pink-soft;
    border: 1px solid $pink-line; border-radius: 3px; padding: 0 3px;
    cursor: pointer; opacity: 0; transition: opacity 0.15s;
  }
  &:hover .kick { opacity: 1; }
  &.invite .a { border-style: dashed; color: $t3; background: #fafafc; }
}

.gi-notice {
  padding: 10px 16px 14px;
  border-top: 2px solid $line;
  border-bottom: 2px solid $line;
  .h { font-size: 12px; color: $t3; margin-bottom: 4px; }
  .c { font-size: 13px; color: $t2; line-height: 1.6; }
}

.gi-settings { padding: 6px 0; }
.set {
  display: flex; align-items: center;
  padding: 11px 16px;
  font-size: 13px; color: $t2;
  .v { margin-left: auto; font-size: 12px; color: $t4; }
}
.sw {
  width: 38px; height: 20px; margin-left: auto;
  border-radius: 10px; background: #e9ebef; border: 2px solid $line;
  position: relative;
  i { position: absolute; top: 1px; left: 1px; width: 14px; height: 14px; border-radius: 50%; background: #fff; }
  &.on { background: $pink; border-color: $pink-deep; i { left: 18px; } }
}

.gi-foot { padding: 12px 16px 16px; border-top: 2px solid $line; }
.danger {
  width: 100%; height: 36px; cursor: pointer;
  border-radius: 5px; border: 2px solid $pink-line;
  background: $pink-soft; color: $pink-deep; font-size: 13px;
  box-shadow: 3px 3px 0 #f7e4ea;
}
</style>
