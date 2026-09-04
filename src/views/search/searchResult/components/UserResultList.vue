<template>
  <div class="user-result-grid">
    <div
      v-for="item in list"
      :key="getUid(item)"
      class="video-card user-card"
      @click="goSpace(getUid(item))"
    >
      <div class="card-cover user-avatar">
        <img
          :src="resolveAvatar(item.avatar)"
          alt=""
          @error="onAvatarError"
        />
      </div>

      <div class="card-info">
        <div class="user-title-row">
          <span class="card-title">{{ item.nickname || '未知用户' }}</span>
          <img
            class="user-lv-icon"
            :src="lvIcon(item.userLvInfo?.level)"
            :alt="`Lv${item.userLvInfo?.level ?? 0}`"
          />
          <span v-if="sexText(item.sex)" class="user-sex-tag">{{ sexText(item.sex) }}</span>
        </div>

        <div class="card-meta">
          <span> {{ item.userFollowInfo?.fansCount ?? 0 }}<span v-if="(item.userFollowInfo?.fansCount ?? 0) >= 10000">万</span>粉丝</span>
          <span>投稿 {{ item.videoCount ?? 0 }}</span>
          <span> {{ item.signature || '这个人很懒，什么都没写' }}</span>
        </div>
        <!-- stop：点关注时不要冒泡到卡片的 goSpace -->
        <button
          type="button"
          class="user-follow-btn"
          :class="{ followed: isFollowed(item) }"
          :disabled="followingUid === getUid(item)"
          @click.stop="onFollow(item)"
        >
          {{ isFollowed(item) ? '已关注' : '+ 关注' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import defaultAvatar from '../../../../assets/avatar/default.png'
import { followUser, type SearchUserItem } from '../../../../services/api'
import { getUserInfo } from '../../../../services/userStorage'

defineProps<{
  list: SearchUserItem[]
}>()

const cosHost = (import.meta.env.VITE_COS_HOST as string | undefined)?.replace(/\/$/, '') || ''

/** 本页点过关注/取关后的本地状态（toggle 后切换文案） */
const followedMap = ref<Record<number, boolean>>({})
/** 正在请求中的目标 uid，防止连点 */
const followingUid = ref<number | null>(null)

const getUid = (item: SearchUserItem) => item.uid ?? item.UID

const isFollowed = (item: SearchUserItem) => {
  const uid = getUid(item)
  if (uid == null) return false
  return !!followedMap.value[uid]
}

/**
 * 点关注：
 * 1. 未登录 → 提示
 * 2. 不能关注自己
 * 3. POST /api/user/follow { followId }
 */
const onFollow = async (item: SearchUserItem) => {
  const targetUid = getUid(item)
  if (targetUid == null) {
    message.warning('用户信息异常')
    return
  }

  const me = getUserInfo()
  if (!me?.uid) {
    message.warning('请先登录后再关注哦~')
    return
  }
  if (me.uid === targetUid) {
    message.warning('不能关注自己哦~')
    return
  }
  if (followingUid.value === targetUid) return

  followingUid.value = targetUid
  try {
    const res = await followUser({ followId: targetUid })
    if (res?.data) {
      // 后端是 toggle：本地翻转按钮文案
      const next = !isFollowed(item)
      followedMap.value = { ...followedMap.value, [targetUid]: next }
      message.success(next ? '关注成功' : '已取消关注')
      // 粉丝数本地 +1 / -1（搜索列表来自 ES，可能本来就不准）
      if (item.userFollowInfo) {
        const cur = item.userFollowInfo.fansCount ?? 0
        item.userFollowInfo.fansCount = Math.max(0, cur + (next ? 1 : -1))
      }
    } else {
      message.error(res?.msg || '关注失败')
    }
  } catch {
    // 错误文案已在 request.ts 里弹出
  } finally {
    followingUid.value = null
  }
}

/** 相对路径补全 COS host；已是完整 URL 则直接用 */
const resolveAvatar = (avatar?: string | null) => {
  if (!avatar) return defaultAvatar
  if (/^https?:\/\//i.test(avatar)) return avatar
  if (cosHost) return `${cosHost}${avatar.startsWith('/') ? '' : '/'}${avatar}`
  return avatar
}

const lvIcon = (level?: number | null) => {
  const lv = Math.min(Math.max(level ?? 0, 0), 6)
  return new URL(`../../../../assets/lv_logo/lv${lv}.png`, import.meta.url).href
}

const sexText = (sex?: number | null) => {
  if (sex === 1) return '男'
  if (sex === 2) return '女'
  return ''
}

const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = defaultAvatar
}

const goSpace = (uid?: number) => {
  if (!uid) return
  window.open(`/space/${uid}`, '_blank')
}
</script>
