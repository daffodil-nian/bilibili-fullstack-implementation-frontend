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
          <a-avatar
          class="space-avatar"
          :size="76"
          :src="profileAvatar"
        />
        <div class="change-avatar" @click="changeAvatar">更换头像</div>
        </div>
        
        <!-- <div class="space-profile-meta">
          <div class="space-profile-row">
            <span class="space-nickname">{{ displayUser?.nickname || '未登录用户' }}</span>
            <span class="space-pic-lv">
              <img class="lv_picture":src="lvSrc" alt="等级"/>
            </span>
            
            <span class="space-badge">大会员</span>
            <span class="space-badge space-badge-medal">+ 粉丝勋章</span>
          </div>
          
           <a-input v-model:value="value" placeholder="修改签名" 
           v-if="isEditing" class="edit-input" @blur="handleSave"/>
           <div class="space-sign" v-else>
            {{ displaySign }}
          </div>
        </div> -->
        <div class="space-profile-meta">
  <div class="space-profile-row">
    <span class="space-nickname">{{ displayUser?.nickname || '未登录用户' }}</span>
    <span class="space-pic-lv">
      <img class="lv_picture" :src="lvSrc" alt="等级"/>
    </span>
    <span class="space-badge">大会员</span>
    <span class="space-badge space-badge-medal">+ 粉丝勋章</span>
  </div>

  <!-- 签名区域 -->
  <!-- 编辑态：带白色背景的输入框，失焦或敲回车自动保存 -->
  <a-input 
    v-if="isEditing" 
    ref="inputRef"
    v-model:value="value" 
    placeholder="设置签名，让大家认识你" 
    class="edit-input"
    :maxlength="60"
    @blur="handleSave"
    @keyup.enter="handleSave"
  />

  <!-- 接下来完善修改用户名称的功能 -->


  <!-- 展示态：未点击时普通文本显示，点击后切换为编辑态 -->
  <div v-else class="space-sign" @click="handleEdit">
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
  <div>
    <!-- <a-avatar :src="" :size="100" /> -->
  </div>
  <div class="space-page">
    <div v-if="activeTab === 'home'">
      <h2>主页</h2>
      <p>这里是主页内容</p>
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
      <h2>
        合集和系列
      </h2>
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
      <p>这里是设置内容</p>
    </div>
    <!-- <h2>个人空间</h2>
    <p>UID: {{ uid }}</p> -->
  </div>
  <!-- 原来的a-card全部删掉，替换成下面 -->
<div class="space-card-wrap" v-if="activeTab === 'home' || activeTab === 'dynamic'">
  <!-- 申请bilibili认证 仿截图 -->
  <div class="space-tip-block" >
    <div class="tip-block-title" >点此申请bilibili认证 <span class="arrow">></span></div>
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
    <div class="tip-block-title" >个人资料 <span class="arrow" @click="goToProfile">></span></div>
    <div class="tip-block-desc">修改你的个人信息</div>
  </div>
</div>
  <!-- <a-card title="点此申请bilibili认证" style="width: 300px">
    <template #extra><a href="#">more</a></template>
    <p>card content</p>
    <p>card content</p>
    <p>card content</p>
  </a-card>
  <a-card title="创作中心" style="width: 300px">
    <template #extra><a href="#">more</a></template>
    <p>card content</p>
    <p>card content</p>
    <p>card content</p>
  </a-card>
  <a-card title="公告" style="width: 300px">
    <template #extra><a href="#">more</a></template>
    <p>card content</p>
    <p>card content</p>
    <p>card content</p>
  </a-card>
  <a-card title="个人资料" style="width: 300px">
    <template #extra><a href="#">more</a></template>
    <p>card content</p>
    <p>card content</p>
    <p>card content</p>
  </a-card> -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref,watch,nextTick } from 'vue'
import { useRoute } from 'vue-router'
import BilibiliHeader from '../../components/layout/BilibiliHeader.vue'
import HeaderBanner from '../../components/header/index.vue'
import biliLogo from '../../assets/bilibili_blue_logo.png'
import defaultAvatar from '../../assets/avatar/default.png'
import { getUserInfo,updateUserField } from '../../services/userStorage'
import type { UserBaseInfo } from '../../services/types'
import {changeSignature} from "../../services/api.ts"
import {message} from "ant-design-vue"
import {useRouter} from "vue-router"
const router=useRouter()

/** 空间页头图高度，需要更高/更矮只改这一处 */
const bannerHeight = 255

const isEditing=ref(false);
const value =ref<string>('');
const route = useRoute()
const uid = computed(() => route.params.uid)
const inputRef = ref<any>(null) // 获取组件节点用于 focus
const currentUser = ref<UserBaseInfo | null>(null)
const userSignature = ref('')
// const changeAvatar=ref(false);
  watch(value,()=>{
    console.log(value.value+"百无禁忌");
  
  }
)
onMounted(() => {
  currentUser.value = getUserInfo()
})
const changeAvatar=()=>{
  //实现逻辑
  // router.push({
  //   path: '/settingPage',
  //   query:{
  //     activeKey:'avatar'
  //   }
  // })
  const url=  `/settingPage?activeKey=avatar`
  window.open(url, '_blank') // 在新标签页打开
}

const goToProfile = () => {
  // 跳转到个人资料页
  // window.location.href = '/settingPage'
  window.open('/settingPage', '_blank') // 在新标签页打开
}

const handleEdit = () => {
  value.value = userSignature.value // 把当前值赋给输入框
  isEditing.value = true
  
  // 必须 nextTick，等 DOM 渲染出 input 后再聚焦
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 失焦或敲回车触发保存，恢复为展示态
const handleSave = async () => {
  // 如果当前不在编辑状态，直接返回
  if (!isEditing.value) return

  // 先切回展示模式
  isEditing.value = false

  // 如果内容没变，不需要发起网络请求
  if (value.value === userSignature.value) return

  try {
    // 1. 调用 api 函数：按照 UpdateSignatureReq 的结构传入对象 { signature: "..." }
    // 注意：后端是 Map<String, String> body，其 key 为 "signature"
    const res = await changeSignature({ signature: value.value })

    // 2. 判断请求结果（如果你的 request 工具类已经自动抛错，这里能跑通就说明成功了）
    userSignature.value = value.value // 保存成功，更新页面展示的签名
    message.success('签名修改成功')
    // const userInfo = getUserInfo()
    // userInfo?.signature=value.value
    updateUserField('signature',userSignature.value)

  } catch (error) {
    // 3. 修改失败：把输入框的值还原回修改前的签名
    value.value = userSignature.value
    console.error('修改签名失败：', error)
  }
}
const handleChangeAvatar=()=>{

}

const handleSaveNickname=()=>{

}
const lvSrc =computed(()=>{
  const level=currentUser.value?.userLvInfo.level ?? 0
  return new URL(`../../assets/lv_logo/lv${level}.png`, import.meta.url).href
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
  () => (displayUser.value as any)?.signature || '这个人很调皮，什么也不留下！22娘都看不下去了！',
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
