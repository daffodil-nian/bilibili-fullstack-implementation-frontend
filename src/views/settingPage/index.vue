<template>
  <div class="setting-page">
    <!-- 顶栏：蓝底 + logo + 云朵装饰 -->
    <header class="setting-header">
      <div class="setting-header-clouds" aria-hidden="true" />
      <div class="setting-header-mascots" aria-hidden="true">
        <span class="mascot mascot-22" />
        <span class="mascot mascot-33" />
      </div>
      <div class="setting-header-inner">
        <img
          :src="biliLogo"
          class="setting-logo"
          alt="bilibili"
          @click="goHome"
        />
      </div>
    </header>

    <div class="setting-body">
      <!-- 侧栏 + 内容：同一白底外框，贴近 B 站个人中心 -->
      <div class="setting-panel">
        <aside class="setting-sider">
          <div class="sider-title">个人中心</div>
          <ul class="sider-nav">
            <li
              v-for="item in menuItems"
              :key="item.key"
              class="sider-item"
              :class="{ 'is-active': activeKey === item.key }"
              @click="onMenuClick(item)"
            >
              <component :is="item.icon" class="sider-icon" />
              <span class="sider-text">{{ item.label }}</span>
            </li>

            <li class="sider-divider" role="separator" />

            <li
              v-for="item in linkItems"
              :key="item.key"
              class="sider-item sider-item-link"
              @click="onLinkClick(item)"
            >
              <component :is="item.icon" class="sider-icon" />
              <span class="sider-text">{{ item.label }}</span>
              <span class="sider-arrow">›</span>
            </li>
          </ul>
        </aside>

        <main class="setting-content">
          <InfoPanel v-if="activeKey === 'info'" />
          <MyAvatar v-else-if="activeKey === 'avatar'" />
          <div v-else class="placeholder-panel">
            <h2 class="content-title">{{ activeLabel }}</h2>
            <p class="placeholder-text">功能开发中，敬请期待</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeOutlined,
  CrownOutlined,
  PayCircleOutlined,
  ProfileOutlined,
  PictureOutlined,
  TagOutlined,
  TrophyOutlined,
  LockOutlined,
  StopOutlined,
  WalletOutlined,
  HistoryOutlined,
  IdcardOutlined,
  UserAddOutlined,
  BellOutlined,
  UserOutlined,
  ShopOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
} from '@ant-design/icons-vue'
import biliLogo from '../../assets/bilibili_blue_logo.png'
import { getUserInfo } from '../../services/userStorage.ts'
import InfoPanel from './children/info.vue'
import {onMounted} from 'vue'
import MyAvatar from './children/MyAvatar.vue'
import {useRoute} from "vue-router";
const route = useRoute()
type MenuItem = {
  key: string
  label: string
  icon: Component
}

type LinkItem = MenuItem & {
  action: 'space' | 'external'
  href?: string
}

const router = useRouter()
// const initKey = 
const queryKey=route.query.activeKey as string
const activeKey = queryKey ? ref(queryKey) : ref('info');
onMounted(()=>{
console.log(queryKey+"")
})
const menuItems: MenuItem[] = [
  { key: 'home', label: '首页', icon: HomeOutlined },
  { key: 'member', label: '大会员', icon: CrownOutlined },
  { key: 'points', label: '会员积分', icon: PayCircleOutlined },
  { key: 'info', label: '我的信息', icon: ProfileOutlined },
  { key: 'avatar', label: '我的头像', icon: PictureOutlined },
  { key: 'fansMedal', label: '粉丝勋章', icon: TagOutlined },
  { key: 'achievement', label: '成就勋章', icon: TrophyOutlined },
  { key: 'security', label: '账号安全', icon: LockOutlined },
  { key: 'blacklist', label: '黑名单管理', icon: StopOutlined },
  { key: 'coins', label: '我的硬币', icon: WalletOutlined },
  { key: 'records', label: '我的记录', icon: HistoryOutlined },
  { key: 'realname', label: '实名认证', icon: IdcardOutlined },
  { key: 'invite', label: '邀请注册', icon: UserAddOutlined },
  { key: 'notify', label: '通知设置', icon: BellOutlined },
]

const linkItems: LinkItem[] = [
  { key: 'space', label: '个人空间', icon: UserOutlined, action: 'space' },
  { key: 'wallet', label: '我的钱包', icon: ShopOutlined, action: 'external', href: '#' },
  { key: 'create', label: '创作中心', icon: VideoCameraOutlined, action: 'external', href: '#' },
  { key: 'live', label: '直播中心', icon: DesktopOutlined, action: 'external', href: '#' },
]

const activeLabel = computed(
  () => menuItems.find((m) => m.key === activeKey.value)?.label ?? '',
)

const goHome = () => {
  router.push('/')
}

const onMenuClick = (item: MenuItem) => {
  if (item.key === 'home') {
    router.push('/')
    return
  }
  activeKey.value = item.key
}

const onLinkClick = (item: LinkItem) => {
  if (item.action === 'space') {
    const user = getUserInfo()
    if (user?.uid) {
      window.open(`/space/${user.uid}`, '_blank')
    } else {
      router.push('/')
    }
    return
  }
  if (item.href && item.href !== '#') {
    window.open(item.href, '_blank')
  }
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
