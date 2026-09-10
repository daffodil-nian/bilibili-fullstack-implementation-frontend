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
        <div class="wrap">
          <a-avatar class="space-avatar" :size="76" :src="profileAvatar" />
          <div v-if="isSelf" class="change-avatar" @click="changeAvatar">更换头像</div>
        </div>

        <div class="space-profile-meta">
          <div class="space-profile-row">
            <span class="space-nickname">{{ displayNickname }}</span>
            <span class="space-pic-lv">
              <img class="lv_picture" :src="lvSrc" alt="等级" />
            </span>
            <span class="space-badge">大会员</span>
            <span class="space-badge space-badge-medal">+ 粉丝勋章</span>
          </div>

          <a-input
            v-if="isSelf && isEditing"
            ref="inputRef"
            v-model:value="value"
            placeholder="设置签名，让大家认识你"
            class="edit-input"
            :maxlength="60"
            @blur="handleSave"
            @keyup.enter="handleSave"
          />
          <div
            v-else
            class="space-sign"
            :style="{ cursor: isSelf ? 'pointer' : 'default' }"
            @click="handleEdit"
          >
            {{ displaySign }}
          </div>
        </div>
      </div>

      <div class="space-profile-right">
        <template v-if="isSelf">
          <button type="button" class="space-tool-btn space-view-btn">
            视角：我自己
            <span class="space-caret">▼</span>
          </button>
          <button type="button" class="space-tool-btn space-skin-btn" title="更换装扮">
            👕
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="space-tool-btn space-follow-btn"
            :class="{ followed: otherSpace?.followed }"
            :disabled="followLoading"
            @click="onFollow"
          >
            {{ otherSpace?.followed ? '已关注' : '+ 关注' }}
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- 头图下方：空间 Tab + 关注/粉丝 -->
  <div class="space-subnav">
    <div class="space-tabs">
      <div
        v-for="tab in visibleTabs"
        :key="tab.key"
        class="space-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <!-- <span class="space-tab-icon">{{ tab.icon }}</span> -->
         <img class="space-tab-icon" :src="tab.icon" alt="" />
        <span class="space-tab-text">{{ tab.label }}</span>
        <span v-if="tab.count != null" class="space-tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <div class="space-sub-search">
      <input class="space-search-input" placeholder="搜索视频、动态" />
      <span class="space-search-icon">🔍</span>
    </div>

    <div class="space-stats">
      <div class="space-stat-item" @click="openFollows">
        <div class="space-stat-label">关注数</div>
        <div class="space-stat-num">{{ followCount }}</div>
      </div>
      <div class="space-stat-item" @click="openFans">
        <div class="space-stat-label">粉丝数</div>
        <div class="space-stat-num">{{ fansCount }}</div>
      </div>
    </div>
  </div>

  <div class="space-page">
    <div v-if="loading" class="space-loading">加载中...</div>
    <template v-else>
      <div v-if="activeTab === 'home'">
        <h2>主页</h2>
        <p v-if="displayBirthday">生日：{{ displayBirthday }}</p>
        <p v-if="!isSelf">获赞 {{ otherSpace?.likeCount ?? 0 }} · 播放 {{ otherSpace?.playCount ?? 0 }}</p>
      </div>
      <div v-else-if="activeTab === 'dynamic'">
        <h2>动态</h2>
        <p>这里是动态内容</p>
      </div>
      <div v-else-if="activeTab === 'video'">
        <h2>视频</h2>
        <p>这里是视频内容</p>
      </div>
      <div v-else-if="activeTab === 'collection'">
        <h2>合集和系列</h2>
      </div>
      <div v-else-if="activeTab === 'fav'">
        <h2>收藏</h2>
        <p>这里是收藏内容</p>
      </div>
      <div v-else-if="activeTab === 'bangumi'">
        <h2>追番追剧</h2>
        <p>这里是追番追剧内容</p>
      </div>
      <div v-else-if="activeTab === 'setting'">
        <h2>设置</h2>
        <p>更多设置请前往个人中心</p>
        <a-button type="link" @click="goToProfile">打开个人中心</a-button>
      </div>
      <FollowPanel
      v-else-if="activeTab==='follows'||activeTab==='fans'"
      />
    </template>
  </div>

  <div class="space-card-wrap" v-if="isSelf && (activeTab === 'home' || activeTab === 'dynamic')">
    <div class="space-tip-block">
      <div class="tip-block-title">
        点此申请bilibili认证 <span class="arrow">></span>
      </div>
      <div class="tip-block-desc">获得认证，享受多重认证福利！</div>
    </div>

    <div class="space-tip-block">
      <div class="tip-block-title">创作中心 <span class="arrow">></span></div>
      <div class="tip-block-desc">前往创作中心管理稿件</div>
    </div>

    <div class="space-tip-block">
      <div class="tip-block-title">公告 <span class="arrow">></span></div>
      <div class="tip-block-desc">平台最新公告通知</div>
    </div>

    <div class="space-tip-block">
      <div class="tip-block-title">
        个人资料 <span class="arrow" @click="goToProfile">></span>
      </div>
      <div class="tip-block-desc">修改你的个人信息</div>
    </div>
  </div>

  <!-- 关注 / 粉丝列表抽屉：自己和别人都走后端列表接口 -->
  <a-drawer
    v-model:open="listVisible"
    :title="listTitle"
    width="380"
    :destroy-on-close="true"
  >
    <div v-if="listLoading" class="space-loading">加载中...</div>
    <div v-else-if="!listUsers.length" class="space-list-empty">暂无数据</div>
    <div v-else class="space-user-list">
      <div v-for="u in listUsers" :key="u.uid" class="space-user-row">
        <a-avatar :size="48" :src="u.avatar || defaultAvatar" />
        <div class="space-user-meta" @click="goUserSpace(u.uid)">
          <div class="space-user-name">{{ u.nickname || '用户' }}</div>
          <div class="space-user-sign">{{ u.signature || '这个人很调皮，什么也不留下！' }}</div>
        </div>
        <button
          v-if="meUid != null && meUid !== u.uid"
          type="button"
          class="space-mini-follow"
          :class="{ followed: u.followed }"
          @click="toggleListFollow(u)"
        >
          {{ u.followed ? '已关注' : '+ 关注' }}
        </button>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import FollowPanel from '../follow/components/FollowPanel/index.vue'
import { useFollowStore } from '../../stores/follow.ts'
import BilibiliHeader from '../../components/layout/BilibiliHeader.vue'
import HeaderBanner from '../../components/header/index.vue'
import biliLogo from '../../assets/bilibili_blue_logo.png'
import defaultAvatar from '../../assets/avatar/default.png'
import { getUserInfo, updateUserField } from '../../services/userStorage'
import type { UserBaseInfo } from '../../services/types'
import {
  changeSignature,
  followUser,
  getUserSpace,
  listFans,
  listFollows,
  type UserSimpleVO,
  type UserSpaceVO,
} from '../../services/api'

import homeNormal from '../../assets/icons/home/homePage.png'
import dynamicNormal from '../../assets/icons/home/windmill.png'
import TvNormal from '../../assets/icons/home/tv.png'
import hejiNormal from '../../assets/icons/home/summary.png'
import collectionNormal from '../../assets/icons/home/collect.png'
import loveNormal from '../../assets/icons/home/love.png'
import settingNormal from '../../assets/icons/home/setting.png'


const bannerHeight = 255
const route = useRoute()

const targetUid = computed(() => Number(route.params.uid))

/** 本地登录用户（自己主页用） */
const currentUser = ref<UserBaseInfo | null>(null)
const userSignature = ref('')

/** 别人主页：后端 UserSpaceVO */
const otherSpace = ref<UserSpaceVO | null>(null)
const loading = ref(false)
const followLoading = ref(false)

const meUid = computed(() => {
  const u = currentUser.value || getUserInfo()
  return u?.uid ?? (u as any)?.UID ?? null
})
const isSelf = computed(
  () => meUid.value != null && !Number.isNaN(targetUid.value) && meUid.value === targetUid.value,
)

const isEditing = ref(false)
const value = ref('')
const inputRef = ref<any>(null)

const listVisible = ref(false)
const listTitle = ref('')
const listUsers = ref<UserSimpleVO[]>([])
const listLoading = ref(false)
const listPage = ref(1)
const listKind = ref<'follows' | 'fans'>('follows')

const activeTab = ref('home')
const allTabs = [
  { key: 'home', label: '主页', icon:homeNormal },
  { key: 'dynamic', label: '动态', icon: dynamicNormal },
  { key: 'video', label: '投稿', icon: TvNormal, count: 0 },
  { key: 'collection', label: '合集和系列', icon: collectionNormal },
  { key: 'fav', label: '收藏', icon: loveNormal, count: 0 },
  { key: 'bangumi', label: '追番追剧', icon: hejiNormal },
  { key: 'setting', label: '设置', icon: settingNormal, selfOnly: true },
]

const visibleTabs = computed(() =>
  allTabs.filter((t) => !(t as { selfOnly?: boolean }).selfOnly || isSelf.value),
)

/**
 * 自己：读 localStorage
 * 别人：调 GET /api/user/{uid}/space
 */
async function loadSpace() {
  if (!targetUid.value || Number.isNaN(targetUid.value)) return

  // 先拿本地登录态，用来判断是不是自己
  currentUser.value = getUserInfo()

  if (isSelf.value) {
    otherSpace.value = null
    userSignature.value = currentUser.value?.signature || ''
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await getUserSpace(targetUid.value)
    otherSpace.value = res.data
  } catch (e) {
    console.error('加载他人空间失败', e)
    otherSpace.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadSpace)
watch(targetUid, () => {
  activeTab.value = 'home'
  loadSpace()
})

// ===== 展示：自己走 local，别人走 otherSpace =====
const displayNickname = computed(() => {
  if (isSelf.value) return currentUser.value?.nickname || '未登录用户'
  return otherSpace.value?.nickname || '用户'
})

const profileAvatar = computed(() => {
  if (isSelf.value) return currentUser.value?.avatar || defaultAvatar
  return otherSpace.value?.avatar || defaultAvatar
})

const displaySign = computed(() => {
  if (isSelf.value) {
    return userSignature.value || '这个人很调皮，什么也不留下！22娘都看不下去了！'
  }
  return otherSpace.value?.signature || '这个人很调皮，什么也不留下！22娘都看不下去了！'
})

const followCount = computed(() => {
  if (isSelf.value) return currentUser.value?.userFollowInfo?.followCount ?? 0
  return otherSpace.value?.followCount ?? 0
})

const fansCount = computed(() => {
  if (isSelf.value) return currentUser.value?.userFollowInfo?.fansCount ?? 0
  return otherSpace.value?.fansCount ?? 0
})

const displayBirthday = computed(() => {
  if (isSelf.value) return currentUser.value?.birthDay || currentUser.value?.birthday || ''
  return otherSpace.value?.birthday || ''
})

const lvSrc = computed(() => {
  const level = isSelf.value
    ? (currentUser.value?.userLvInfo?.level ?? 0)
    : (otherSpace.value?.level ?? 0)
  return new URL(`../../assets/lv_logo/lv${level}.png`, import.meta.url).href
})

const changeAvatar = () => {
  if (!isSelf.value) return
  window.open('/settingPage?activeKey=avatar', '_blank')
}

const goToProfile = () => {
  window.open('/settingPage', '_blank')
}

const handleEdit = () => {
  if (!isSelf.value) return
  value.value = userSignature.value
  isEditing.value = true
  nextTick(() => inputRef.value?.focus())
}

const handleSave = async () => {
  if (!isEditing.value || !isSelf.value) return
  isEditing.value = false
  if (value.value === userSignature.value) return
  try {
    await changeSignature({ signature: value.value })
    userSignature.value = value.value
    updateUserField('signature', value.value)
    currentUser.value = getUserInfo()
    message.success('签名修改成功')
  } catch (error) {
    value.value = userSignature.value
    console.error('修改签名失败：', error)
  }
}

async function onFollow() {
  if (meUid.value == null) {
    message.warning('请先登录')
    return
  }
  if (isSelf.value || followLoading.value) return
  followLoading.value = true
  try {
    await followUser({ followId: targetUid.value })
    // 别人主页：再拉一次后端刷新 followed / 粉丝数
    const res = await getUserSpace(targetUid.value)
    otherSpace.value = res.data
  } finally {
    followLoading.value = false
  }
}

//这是打开follows的一个方法，执行它页面内容就切换成自定义的写法了

async function openFollows() {
  // 自己永远能看；别人看 showFollowList
  if (!isSelf.value && otherSpace.value?.showFollowList === false) {
    message.warning('该用户已设置关注列表不可见')
    return
  }
  // listKind.value = 'follows'
  // listTitle.value = '关注列表'
  // listPage.value = 1
  // listVisible.value = true
  // await loadRelationList()
  activeTab.value = 'follows'

  //然后就对接前端的一个面板，这里就调用useFollowStore中的switchSide去切换面板
  await useFollowStore().switchSide('follows');

}

async function openFans() {
  if (!isSelf.value && otherSpace.value?.showFansList === false) {
    message.warning('该用户已设置粉丝列表不可见')
    return
  }
  //和上面同理
  activeTab.value = 'fans'

  //然后就调用userFollowStore中的switchSide去切换面板
  await useFollowStore().switchSide('fans');//这个方法会调用后端接口，到时候可以实现翻页效果

}

async function loadRelationList() {
  listLoading.value = true
  try {
    const res =
      listKind.value === 'follows'
        ? await listFollows(targetUid.value, listPage.value, 24)
        : await listFans(targetUid.value, listPage.value, 24)
    listUsers.value = res.data || []
  } catch (e) {
    listUsers.value = []
    console.error(e)
  } finally {
    listLoading.value = false
  }
}

async function toggleListFollow(u: UserSimpleVO) {
  if (meUid.value == null) {
    message.warning('请先登录')
    return
  }
  await followUser({ followId: u.uid })
  u.followed = !u.followed
  // 自己主页关注数在 local，简单 ±1；别人主页重新拉 space
  if (isSelf.value && currentUser.value?.userFollowInfo) {
    const delta = u.followed ? 1 : -1
    currentUser.value.userFollowInfo.followCount = Math.max(
      0,
      (currentUser.value.userFollowInfo.followCount ?? 0) + delta,
    )
    updateUserField('userFollowInfo', currentUser.value.userFollowInfo)
  } else if (!isSelf.value) {
    const res = await getUserSpace(targetUid.value)
    otherSpace.value = res.data
  }
}

function goUserSpace(uid: number) {
  window.open(`/space/${uid}`, '_blank')
}
</script>

<style scoped src="./style.scss"></style>
