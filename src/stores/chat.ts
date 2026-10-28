import { ref, computed } from "vue"
import { defineStore } from "pinia"
import type { ContactItemVO, ChatMessageVO,GroupInfoVO,GroupMemberVO } from "../services/types"
import {
  listChatContacts,
  listChatMessages,
  markChatRead,
  sendChatText,
  sendChatGroupText,
  dissolveChatGroup,
  quitChatGroup,
  setChatGroupMemberRole,
  kickChatGroupMember,
  inviteChatGroupMembers,
  uploadChatGroupAvatar,
  updateChatGroupNotice,
  updateChatGroupName,
  listChatGroupMembers,
  getChatGroupInfo,
  withdrawChatMessage
} from "../services/api"
import { getUserInfo } from "../services/userStorage"

export const useChatStore = defineStore("chat", () => {
  const contacts = ref<ContactItemVO[]>([])
  const currentRoomId = ref<number | null>(null)
  const currentPeerUid = ref<number | null>(null)
  const messages = ref<ChatMessageVO[]>([])
  const loading = ref(false)

  const myUid = computed(() => getUserInfo()?.uid ?? null)

  const currentContact = computed(
    () => contacts.value.find((c) => c.roomId === currentRoomId.value) ?? null
  )
 const groupInfo = ref<GroupInfoVO | null>(null)
  const groupMembers = ref<GroupMemberVO[]>([])
  const groupLoading = ref(false)
  /** 当前会话是不是群聊 */
  const isGroupChat = computed(() => currentContact.value?.roomType === 1)
  /** 我在这个群里的角色：1 群主 2 管理 3 成员 0 不在群 */
  const myGroupRole = computed(
    () => groupMembers.value.find((m) => m.uid === myUid.value)?.role ?? 0
  )

  /*
  是不是群主
  */
 const isGroupOwner = computed(()=>isGroupChat.value && myGroupRole.value === 1)
 /**
  * 是否是群主或者管理员
  */
 const canManageGroup = computed(()=>isGroupChat.value &&(myGroupRole.value === 1 || myGroupRole.value === 2))


/** 拉群资料 + 成员（一次拿全） */
  async function loadGroupInfo(roomId: number) {
    groupLoading.value = true
    try {
      const [infoRes, memberRes] = await Promise.all([
        getChatGroupInfo(roomId),
        listChatGroupMembers(roomId),
      ])
      groupInfo.value = infoRes.data ?? null
      groupMembers.value = memberRes.data ?? []
    } finally {
      groupLoading.value = false
    }
  }
  /** 清空群状态（切到单聊或退出群时用） */
  function clearGroupInfo() {
    groupInfo.value = null
    groupMembers.value = []
  }
  // ==================== 群管理动作 ====================

  
  async function renameGroup(name: string) {
    if (currentRoomId.value == null) return false
    const res = await updateChatGroupName(currentRoomId.value, name.trim())
    if (res.code === 0 || res.code === 200) {
      if (groupInfo.value) groupInfo.value.groupName = name.trim()
      // 会话列表里的群名也要跟着变
      const hit = contacts.value.find((c) => c.roomId === currentRoomId.value)
      if (hit) hit.name = name.trim()
    }
    return res.code === 0 || res.code === 200
  }
  async function changeGroupNotice(notice: string) {
    if (currentRoomId.value == null) return false
    const res = await updateChatGroupNotice(currentRoomId.value, notice)
    if ((res.code === 0 || res.code === 200) && groupInfo.value) {
      groupInfo.value.notice = notice
    }
    return res.code === 0 || res.code === 200
  }
  async function changeGroupAvatar(file: File) {
    if (currentRoomId.value == null) return false
    const res = await uploadChatGroupAvatar(currentRoomId.value, file)
    if ((res.code === 0 || res.code === 200) && groupInfo.value) {
      groupInfo.value.groupAvatar = res.data
    }
    return res.code === 0 || res.code === 200
  }
  async function inviteMembers(uids: number[]) {
    if (currentRoomId.value == null) return false
    const res = await inviteChatGroupMembers(currentRoomId.value, uids)
    if (res.code === 0 || res.code === 200) {
      await loadGroupInfo(currentRoomId.value)
    }
    return res.code === 0 || res.code === 200
  }
  async function kickMember(targetUid: number) {
    if (currentRoomId.value == null) return false
    const res = await kickChatGroupMember(currentRoomId.value, targetUid)
    if (res.code === 0 || res.code === 200) {
      groupMembers.value = groupMembers.value.filter((m) => m.uid !== targetUid)
      if (groupInfo.value?.memberCount) groupInfo.value.memberCount--
    }
    return res.code === 0 || res.code === 200
  }
  async function setMemberRole(targetUid: number, role: number) {
    if (currentRoomId.value == null) return false
    const res = await setChatGroupMemberRole(currentRoomId.value, targetUid, role)
    if (res.code === 0 || res.code === 200) {
      const hit = groupMembers.value.find((m) => m.uid === targetUid)
      if (hit) hit.role = role
    }
    return res.code === 0 || res.code === 200
  }
  /** 退出群聊 */
  async function quitCurrentGroup() {
    if (currentRoomId.value == null) return false
    const roomId = currentRoomId.value
    const res = await quitChatGroup(roomId)
    if (res.code === 0 || res.code === 200) {
      contacts.value = contacts.value.filter((c) => c.roomId !== roomId)
      currentRoomId.value = null
      currentPeerUid.value = null
      messages.value = []
      clearGroupInfo()
      await fetchContacts()
    }
    return res.code === 0 || res.code === 200
  }
  /** 解散群聊（群主） */
  async function dissolveCurrentGroup() {
    if (currentRoomId.value == null) return false
    const roomId = currentRoomId.value
    const res = await dissolveChatGroup(roomId)
    if (res.code === 0 || res.code === 200) {
      contacts.value = contacts.value.filter((c) => c.roomId !== roomId)
      currentRoomId.value = null
      currentPeerUid.value = null
      messages.value = []
      clearGroupInfo()
      await fetchContacts()
    }
    return res.code === 0 || res.code === 200
  }

  async function init() {
    currentRoomId.value = null
    currentPeerUid.value = null
    messages.value = []
    await fetchContacts()
  }

  async function fetchContacts() {
    const res = await listChatContacts()
    contacts.value = res.data ?? []
  }

  async function openByRoomId(roomId: number) {
    const hit = contacts.value.find((c) => c.roomId === roomId)
    currentRoomId.value = roomId
    currentPeerUid.value = hit?.peerUid ?? null
    await fetchMessages(roomId)
    await markChatRead(roomId)
    if (hit) hit.unreadCount = 0
    if (hit?.roomType === 1) await syncGroupMembership(roomId)
  }

  /** 空间页私信，只找单聊 */
  async function openByPeerUid(peerUid: number) {
    await fetchContacts()
    const hit = contacts.value.find(
      (c) => c.roomType === 2 && c.peerUid === peerUid
    )
    currentPeerUid.value = peerUid
    if (hit?.roomId != null) {
      await openByRoomId(hit.roomId)
      return
    }
    currentRoomId.value = null
    messages.value = []
  }

  async function fetchMessages(roomId: number) {
    loading.value = true
    try {
      const res = await listChatMessages(roomId, 50)
      messages.value = res.data ?? []
    } finally {
      loading.value = false
    }
  }

  async function sendText(content: string) {
    const text = content.trim()
    if (!text) return

    const contact = currentContact.value
    const roomId = currentRoomId.value
    const isGroup = contact?.roomType === 1 && roomId != null

    if (!isGroup && currentPeerUid.value == null) return

    // ===== ① 乐观插入：本地立刻显示，不等接口 =====
    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const tempId = -Date.now()
    const optimistic: ChatMessageVO = {
      msgId: tempId,
      roomId: roomId ?? undefined,
      fromUid: myUid.value ?? undefined,
      content: text,
      type: 1,
      status: 0,
      createTime:
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    }
    messages.value.push(optimistic)

    // ===== ② 后台发送 =====
    let realId: number | undefined
    try {
      if (isGroup) {
        const res = await sendChatGroupText({ roomId: roomId as number, content: text })
        realId = (res.data as number) ?? undefined
      } else {
        const res = await sendChatText({
          targetUid: currentPeerUid.value as number,
          content: text,
        })
        realId = (res.data as number) ?? undefined
      }
    } catch {
      // 发送失败 → 撤掉临时消息
      messages.value = messages.value.filter((m) => m.msgId !== tempId)
      return
    }

    // ===== ③ 用真实 msgId 替换临时 id =====
    if (realId != null) {
      const hit = messages.value.find((m) => m.msgId === tempId)
      if (hit) hit.msgId = realId
    }

    // 单聊首次发送可能还没有 roomId，补一次
    if (currentRoomId.value == null) {
      await fetchContacts()
      const c = contacts.value.find(
        (x) => x.roomType === 2 && x.peerUid === currentPeerUid.value
      )
      if (c?.roomId != null) currentRoomId.value = c.roomId
    }

    // ===== ④ 会话列表后台刷新（不阻塞输入框）=====
    fetchContacts().catch(() => {})
  }

  /** 群被退出/解散后：清掉本地状态并刷新会话列表 */
  async function handleRoomRemoved(roomId?: number | null) {
    await fetchContacts()
    if (roomId == null) return
    markRoomLeft(roomId)
    const still = contacts.value.some((c) => c.roomId === roomId)
    if (!still && currentRoomId.value === roomId) {
      currentRoomId.value = null
      currentPeerUid.value = null
      messages.value = []
      clearGroupInfo()
    }
  }
  // ===== 我已不在的群（退群 / 被移出 / 群已解散）→ 用于禁用输入框 =====
  const leftRoomIds = ref<Set<number>>(new Set())

  function markRoomLeft(roomId: number) {
    const s = new Set(leftRoomIds.value)
    s.add(roomId)
    leftRoomIds.value = s
  }

  function unmarkRoomLeft(roomId: number) {
    const s = new Set(leftRoomIds.value)
    s.delete(roomId)
    leftRoomIds.value = s
  }

  /** 能不能在这个房间发言 */
  function canSendInRoom(roomId?: number | null) {
    if (roomId == null) return false
    return !leftRoomIds.value.has(roomId)
  }

  /** 打开群会话时校验我还在不在群里（刷新后也能识别） */
  async function syncGroupMembership(roomId: number) {
    if (myUid.value == null) return
    try {
      const res = await listChatGroupMembers(roomId)
      const list = res.data ?? []
      if (list.length === 0) return
      const inGroup = list.some((m) => m.uid === myUid.value)
      if (inGroup) unmarkRoomLeft(roomId)
      else markRoomLeft(roomId)
    } catch {
      markRoomLeft(roomId)
    }
  }


  /** 撤回自己发的一条消息（乐观更新，失败回滚） */
  async function withdrawMessage(messageId: number) {
    const m = messages.value.find((x) => x.msgId === messageId)
    if (!m || m.roomId == null) return false

    // 1. 乐观更新：UI 立刻变
    const backup = { status: m.status, content: m.content }
    m.status = 1
    m.content = '[消息已撤回]'

    // 2. 请求后端
    const ok = await withdrawChatMessage(messageId, m.roomId)
      .then((r) => r.code === 0 || r.code === 200)
      .catch(() => false)

    // 3. 失败回滚
    if (!ok) {
      m.status = backup.status
      m.content = backup.content
    }
    return ok
  }
  return {
    contacts,
    currentRoomId,
    currentPeerUid,
    messages,
    loading,
    myUid,
    currentContact,
    init,
    fetchContacts,
    openByRoomId,
    openByPeerUid,
    fetchMessages,
    sendText,
    handleRoomRemoved,
    canSendInRoom,
    leftRoomIds,
    markRoomLeft,

    // 和群聊的消息相关的接口
 withdrawMessage,


  }
})