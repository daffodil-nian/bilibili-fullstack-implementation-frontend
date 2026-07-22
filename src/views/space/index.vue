<template>
  <div class="home-top">
    <HeaderBanner :height="bannerHeight" />

    <div class="home-nav">
      <img :src="biliLogo" class="logo" alt="bilibili" />
      <div class="home-nav-main">
        <BilibiliHeader :with-banner="true" :banner-height="bannerHeight" />
      </div>
    </div>

    <!-- 头图底部用户信息条（仿 B 站空间） -->
    <div class="space-profile">
      <div class="space-profile-left">
        <a-avatar
          class="space-avatar"
          :size="76"
          :src="profileAvatar"
        />
        <div class="space-profile-meta">
          <div class="space-profile-row">
            <span class="space-nickname">{{ displayUser?.nickname || '未登录用户' }}</span>
            <span class="space-lv">LV{{ displayLevel }}</span>
            <span class="space-badge">大会员</span>
            <span class="space-badge space-badge-medal">+ 粉丝勋章</span>
          </div>
          <div class="space-sign">
            {{ displaySign }}
          </div>
        </div>
      </div>

      <div class="space-profile-right">
        <button type="button" class="space-tool-btn space-view-btn">
          视角：我自己
          <span class="space-caret">▼</span>
        </button>
        <button type="button" class="space-tool-btn space-skin-btn" title="更换装扮">
          👕
        </button>
      </div>
    </div>
  </div>

  <!-- 头图下方：空间 Tab + 关注/粉丝 -->
  <div class="space-subnav">
    <div class="space-tabs">
      <div
        v-for="tab in spaceTabs"
        :key="tab.key"
        class="space-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="space-tab-icon">{{ tab.icon }}</span>
        <span class="space-tab-text">{{ tab.label }}</span>
        <span v-if="tab.count != null" class="space-tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <div class="space-sub-search">
      <input class="space-search-input" placeholder="搜索视频、动态" />
      <span class="space-search-icon">🔍</span>
    </div>

    <div class="space-stats">
      <div class="space-stat-item">
        <div class="space-stat-label">关注数</div>
        <div class="space-stat-num">{{ followCount }}</div>
      </div>
      <div class="space-stat-item">
        <div class="space-stat-label">粉丝数</div>
        <div class="space-stat-num">{{ fansCount }}</div>
      </div>
    </div>
  </div>

  <div class="space-page">
    <h2>个人空间</h2>
    <p>UID: {{ uid }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BilibiliHeader from '../../components/layout/BilibiliHeader.vue'
import HeaderBanner from '../../components/header/index.vue'
import biliLogo from '../../assets/bilibili_blue_logo.png'
import defaultAvatar from '../../assets/avatar/default.png'
import { getUserInfo } from '../../services/userStorage'
import type { UserBaseInfo } from '../../services/types'

/** 空间页头图高度，需要更高/更矮只改这一处 */
const bannerHeight = 255

const route = useRoute()
const uid = computed(() => route.params.uid)

const currentUser = ref<UserBaseInfo | null>(null)

onMounted(() => {
  currentUser.value = getUserInfo()
})

/** 优先用本地登录用户；以后可按路由 uid 拉他人资料 */
const displayUser = computed(() => currentUser.value)

const profileAvatar = computed(
  () => displayUser.value?.avatar || defaultAvatar,
)

const displayLevel = computed(
  () => displayUser.value?.userLvInfo?.level ?? 0,
)

const displaySign = computed(
  () => (displayUser.value as any)?.signature || '这个人很懒，什么都没有写~',
)

const followCount = computed(
  () => displayUser.value?.userFollowInfo?.followCount ?? 0,
)

const fansCount = computed(
  () => displayUser.value?.userFollowInfo?.fansCount ?? 0,
)

const activeTab = ref('home')

const spaceTabs = [
  { key: 'home', label: '主页', icon: '🏠' },
  { key: 'dynamic', label: '动态', icon: '🌸' },
  { key: 'video', label: '投稿', icon: '📺', count: 0 },
  { key: 'collection', label: '合集和系列', icon: '📚' },
  { key: 'fav', label: '收藏', icon: '⭐', count: 0 },
  { key: 'bangumi', label: '追番追剧', icon: '❤️' },
  { key: 'setting', label: '设置', icon: '⚙️' },
]
</script>

<style scoped src="./style.scss"></style>
