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
          <span> {{ item.userFollowInfo?.fansCount ?? 0 }}<span v-if="item.userFollowInfo?.fansCount >= 10000">万</span>粉丝</span>
          <span>投稿 {{ item.videoCount ?? 0 }}</span>
          <span> {{ item.signature || '这个人很懒，什么都没写' }}</span>
        </div>
        <button type="button" class="user-follow-btn" @click.stop>
          + 关注
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import defaultAvatar from '../../../../assets/avatar/default.png'
import type { SearchUserItem } from '../../../../services/api'

defineProps<{
  list: SearchUserItem[]
}>()

const cosHost = (import.meta.env.VITE_COS_HOST as string | undefined)?.replace(/\/$/, '') || ''

const getUid = (item: SearchUserItem) => item.uid ?? item.UID

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

const statusText = (status: number) => {
  if (status === 1) return '在线'
  if (status === 0) return '离线'
  return String(status)
}

const formatDate = (value: string) => {
  try {
    return value.slice(0, 10)
  } catch {
    return value
  }
}

const ipText = (ipInfo?: Record<string, unknown> | null) => {
  if (!ipInfo) return ''
  const region =
    (ipInfo.region as string) ||
    (ipInfo.city as string) ||
    (ipInfo.province as string) ||
    (ipInfo.ip as string)
  return region || ''
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
