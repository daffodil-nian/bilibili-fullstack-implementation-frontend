<template>

 <a-config-provider
 :theme="{
  token:{
    colorPrimary:themeColor
  }
 }"
 >
  <div class="nav-box" :class="navThemeClass">
    <!-- 1. 左侧导航区域 -->
    <div class="nav-left">
      <div v-for="item in nav_left" :key="item.title" class="nav-item">
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.title }}</span>
      </div>
    </div>

    <!-- 2. 中间搜索区域 -->
    <div class="search-wrapper">
      <a-input v-model:value="userName" placeholder="搜索" class="nav-search-input">
        <template #suffix>
          <SearchOutlined class="nav-search-icon" />
        </template>
      </a-input>
    </div>

    <!-- 3. 头像与登录/注册弹窗交互核心 -->
    <div class="nav-avatar-container" :class="{ 'is-logged-in': !!currentUser }">
      <!-- 未登录显示「登录」文字；已登录显示头像图（悬停会放大并压在面板顶上） -->
      <a-avatar
        :src="currentUser ? (currentUser.avatar || defaultAvatar) : undefined"
        size="large"
        class="nav-avatar"
        @click="onAvatarClick"
      >
        {{ currentUser ? '' : '登录' }}
      </a-avatar>

      <!-- 未登录：悬浮引导登录 -->
      <div v-if="!currentUser" class="login-tooltip">
        <div class="tooltip-title">登录后你可以:</div>
        <div class="tooltip-content">
          <div class="tooltip-item">
            <div class="tooltip-icon">🎁</div>
            <div class="tooltip-text">免费看高清视频</div>
          </div>
          <div class="tooltip-item">
            <div class="tooltip-icon">🎬</div>
            <div class="tooltip-text">多端同步播放记录</div>
          </div>
          <div class="tooltip-item">
            <div class="tooltip-icon">🔔</div>
            <div class="tooltip-text">发表弹幕/评论</div>
          </div>
          <div class="tooltip-item">
            <div class="tooltip-icon">🎬</div>
            <div class="tooltip-text">热播番剧影视看不停</div>
          </div>
        </div>
        <div class="tooltip-button" @click="showModel('1')">立即登录</div>
        <div class="tooltip-bottom">
          首次使用？
          <span class="register" @click="showModel('3')">点我注册</span>
        </div>
      </div>

      <!-- 已登录：悬浮个人面板（顶上头像由放大后的 nav-avatar 充当） -->
      <div v-else class="user-panel">
        <div class="user-panel-header">
          <div class="user-panel-nickname">{{ currentUser.nickname }}</div>
          <div class="user-panel-currency">
            <span>硬币: {{ currentUser.userWalletResp?.coin ?? 0 }}</span>
            <span>B币: {{ currentUser.userWalletResp?.bcoin ?? 0 }}</span>
          </div>
          <div class="user-panel-stats">
            <div class="stat-item">
              <div class="stat-num">{{ currentUser.userFollowInfo.followCount }}</div>
              <div class="stat-label">关注</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">{{ currentUser.userFollowInfo.fansCount }}</div>
              <div class="stat-label">粉丝</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">0</div>
              <div class="stat-label">动态</div>
            </div>
          </div>
        </div>
        <div class="user-panel-menu">
          <div class="user-panel-item" @click="goSpace">
            <UserOutlined />
            <span>个人中心</span>
          </div>
          <div class="user-panel-item" @click="handleLogout">
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        </div>
      </div>

      <!-- 登录/注册 Modal：仅未登录时需要 -->
      <div v-if="!currentUser" class="popup-page">
        <a-modal 
          v-model:open="open" 
          :title="isRegisterMode ? '官方账号注册' : '扫描二维码登录'" 
          @ok="handleOk" 
          @cancel="handleCancel"
          :ok-text="isRegisterMode ? '提交注册' : '立即登录'"
          :cancel-text="isRegisterMode ? '返回登录' : '切换到注册'"
          width="850px"
          :centered="true"
        >
          <div class="modal-flex-container">
            <!-- 弹窗左侧：动态渲染（登录状态展示二维码，注册状态展示引导图文） -->
            <div v-if="!isRegisterMode" class="popup-left">
              <a-space direction="vertical" align="center" size="middle">
                <a-qrcode :value="qrcodeUrl" :size="160" />
                <div class="qrcode-tip">使用 <span class="highlight">QQ移动端</span> 扫描登录</div>
              </a-space>
            </div>
            <div v-else class="popup-left-register">
              <div class="register-welcome">
                <h2>Create Account</h2>
                <p>构建属于你的专属社交圈子</p>
              </div>
            </div>

            <!-- 弹窗右侧：表单切换核心区 -->
            <div class="popup-right">
              <a-tabs v-model:activeKey="activeKey" tab-position="top">
                
                <!-- 【Tab 1】密码登录 -->
                <a-tab-pane key="1" tab="密码登录">
                  <div class="form-body">
                    <div class="input-item">
                      <a-input v-model:value="pwdForm.account" placeholder="请输入账号/手机号/邮箱" class="form-input" />
                    </div>
                    <div class="input-item password-wrapper">
                      <a-input
                        v-model:value="pwdForm.password"
                        :type="pwdForm.showPwd ? 'text' : 'password'"
                        placeholder="请输入密码"
                        class="form-input"
                      />
                      <span class="eye-icon" @click="pwdForm.showPwd = !pwdForm.showPwd">
                        <EyeOutlined v-if="!pwdForm.showPwd"/>
                        <EyeInvisibleOutlined v-else/>
                      </span>
                      <span class="forget-pwd">忘记密码?</span>
                    </div>
                  </div>
                </a-tab-pane>

                <!-- 【Tab 2】短信登录 -->
                <a-tab-pane key="2" tab="短信登录">
                  <div class="form-body">
                    <div class="input-item">
                      <a-input v-model:value="smsForm.phone" placeholder="请输入手机号码" class="form-input" />
                    </div>
                    <div class="input-item">
                      <a-input-search v-model:value="smsForm.code" placeholder="请输入6位验证码" size="large">
                        <template #enterButton>
                          <a-button type="primary" class="code-btn">获取验证码</a-button>
                        </template>
                      </a-input-search>
                    </div>
                  </div>
                </a-tab-pane>

                <!-- 【Tab 3】新用户注册（在登录状态时被置灰锁死，无法点击顶栏切换） -->
                <a-tab-pane key="3" tab="账号注册" >
                  <div class="form-body">
                    <!-- 用户名 -->
                    <div class="input-item">
                      <a-input v-model:value="registerForm.username" placeholder="请设置个性的用户名" class="form-input" />
                    </div>
                    
                    <!-- 注册密码 -->
                    <div class="input-item password-wrapper">
                      <a-input
                        v-model:value="registerForm.password"
                        :type="registerForm.showPwd ? 'text' : 'password'"
                        placeholder="请设置登录密码"
                        class="form-input"
                      />
                      <span class="eye-icon" @click="registerForm.showPwd = !registerForm.showPwd">
                        <EyeOutlined v-if="!registerForm.showPwd"/>
                        <EyeInvisibleOutlined v-else/>
                      </span>
                    </div>

                    <!-- 确认密码 -->
                    <div class="input-item password-wrapper">
                      <a-input
                        v-model:value="registerForm.confirmPassword"
                        :type="registerForm.showConfirmPwd ? 'text' : 'password'"
                        placeholder="请再次输入密码以确认"
                        class="form-input"
                      />
                      <span class="eye-icon" @click="registerForm.showConfirmPwd = !registerForm.showConfirmPwd">
                        <EyeOutlined v-if="!registerForm.showConfirmPwd"/>
                        <EyeInvisibleOutlined v-else/>
                      </span>
                    </div>
                  </div>
                </a-tab-pane>

              </a-tabs>
            </div>
          </div>
        </a-modal>
      </div>
    </div>

    <!-- 4. 右侧导航与投稿区域 -->
    <div class="nav-right">
      <div v-for="item in nav_right" :key="item.title" class="nav-item">
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.title }}</span>
      </div>

      <a-button class="nav-item-button">
        <UploadOutlined class="nav-item-button-icon"/>
        投稿
      </a-button>
    </div>
  </div>
</a-config-provider>   
</template>

<script setup lang="ts">
import {
  AliwangwangOutlined, PlayCircleFilled, VideoCameraFilled,
  MessageOutlined, StarOutlined, ClockCircleOutlined, 
  BulbOutlined, SearchOutlined, UploadOutlined,
  EyeOutlined, EyeInvisibleOutlined,
  UserOutlined, LogoutOutlined
} from '@ant-design/icons-vue'
import defaultAvatar from '../../assets/avatar/default.png'
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { userLogin, userRegister } from '../../services/api'
import { saveUserInfo, getUserInfo, clearUserInfo } from '../../services/userStorage'
import type { UserBaseInfo } from '../../services/types'

const props = withDefaults(defineProps<{
  /** 首页叠在头图上时开启：滚动前白字，滚过后黑字 */
  withBanner?: boolean
}>(), {
  withBanner: false,
})

const router = useRouter()

// 基础变量
const userName = ref<string>('');
const currentUser = ref<UserBaseInfo | null>(null)
const open = ref<boolean>(false);
const activeKey = ref<string>('1'); // '1': 密码登录, '2': 短信登录, '3': 账号注册
const qrcodeUrl = ref<string>('https://im.qq.com/'); // 二维码解析地址


const themeColor = ref('#26BAEF');
const BANNER_HEIGHT = 130
const isOverBanner = ref(props.withBanner)

const navThemeClass = computed(() => {
  if (!props.withBanner) return 'nav-dark'
  return isOverBanner.value ? 'nav-light' : 'nav-dark'
})

const onScroll = () => {
  if (!props.withBanner) return
  isOverBanner.value = window.scrollY < BANNER_HEIGHT
}

onMounted(() => {
  // 刷新后从 localStorage 恢复登录用户
  currentUser.value = getUserInfo()

  // 2. 获取文档根节点（也就是 :root）的计算样式
  const rootStyles = window.getComputedStyle(document.documentElement);
  
  // 3. 读取你定义的 CSS 变量值，并去掉两边的空格
  const colorFromCss = rootStyles.getPropertyValue('--primary-color').trim();
  
  // 4. 如果成功读取到了，就赋值给响应式变量，驱动组件库变色
  if (colorFromCss) {
    themeColor.value = colorFromCss;
  }

  if (props.withBanner) {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  } else {
    isOverBanner.value = false
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

interface DataItem {
  title: string;
  icon?: any
}

// 核心计算属性：用来判断当前弹窗属于“登录”还是“注册”流程
const isRegisterMode = computed(() => activeKey.value === '3');

// 控制打开弹窗并决定处于什么Tab (1=登录, 3=注册)
const showModel = (targetTab: string = '1') => {
  activeKey.value = targetTab;
  open.value = true;
};

/** 未登录点头像 → 登录框；已登录点头像 → 个人空间 */
const onAvatarClick = () => {
  if (!currentUser.value) {
    showModel('1')
    return
  }
  goSpace()
}

const goSpace = () => {
  if (!currentUser.value?.uid) return
 const route= router.resolve(`/space/${currentUser.value.uid}`)
 window.open(route.href,'_blank')
}

const handleLogout = () => {
  clearUserInfo()
  currentUser.value = null
  message.success('已退出登录')
}

// 密码登录表单
const pwdForm = reactive({
  account: '',
  password: '',
  showPwd: false
});

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: ''
});

// 账号注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  showPwd: false,
  showConfirmPwd: false
});

// 处理底部主按钮（确定/登录/注册）
// 空账号/空密码等校验交给后端 AssertUtil，前端只负责弹出后端返回的 msg
const handleOk = async () => {
  if (isRegisterMode.value) {
    // 仅前端能判断的「两次密码是否一致」留在本地；其余文案以后端为准
    if (
      registerForm.password &&
      registerForm.confirmPassword &&
      registerForm.password !== registerForm.confirmPassword
    ) {
      message.warning('两次输入的密码不一致，请重新检查！')
      return Promise.reject()
    }

    try {
      const body = await userRegister({
        username: registerForm.username,
        password: registerForm.password,
        checkPassword: registerForm.confirmPassword,
      })
      message.success(body.msg || '注册成功')

      // 后端若直接返回用户信息 → 当作已登录
      if (body.data && typeof body.data === 'object' && 'uid' in body.data) {
        saveUserInfo(body.data)
        currentUser.value = body.data
        open.value = false
        resetRegisterForm()
        return
      }

      // 否则：切到密码登录，账号预填，方便用户马上登录
      pwdForm.account = registerForm.username
      pwdForm.password = ''
      resetRegisterForm()
      activeKey.value = '1'
    } catch {
      // 错误原因已在 request.ts 用 message.error 弹出
      return Promise.reject()
    }
    return
  }

  // 密码登录：直接请求，后端 AssertUtil 的 msg 由 request 层弹出
  if (activeKey.value === '1') {
    try {
      const body = await userLogin({
        username: pwdForm.account,
        password: pwdForm.password,
      })
      // 把用户信息存进 localStorage，刷新后还能读到
      if (body.data) {
        saveUserInfo(body.data)
        currentUser.value = body.data
      }
      message.success(body.msg || '登录成功')
      open.value = false
      console.log(body)
    } catch {
      return Promise.reject()
    }
    return
  }

  message.info('短信登录暂未接入')
  return Promise.reject()
};

const resetRegisterForm = () => {
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.showPwd = false
  registerForm.showConfirmPwd = false
}

// 处理底部辅助按钮（取消/切换状态）点击事件
const handleCancel = () => {
  if (isRegisterMode.value) {
    // 处于注册态时：点击此按钮将其切回密码登录
    activeKey.value = '1';
  } else {
    // 处于登录态时：点击此按钮将其切到注册
    activeKey.value = '3';
  }
};

// 静态数据配置
const nav_left: DataItem[] = [
  { title: '首页', icon: AliwangwangOutlined },
  { title: '番剧', icon: PlayCircleFilled },
  { title: '直播', icon: VideoCameraFilled },
  { title: '游戏中心', icon: AliwangwangOutlined },
  { title: '会员购', icon: AliwangwangOutlined },
  { title: '任务中心', icon: AliwangwangOutlined }
];

const nav_right: DataItem[] = [
  { title: '大会员', icon: AliwangwangOutlined },
  { title: '消息', icon: MessageOutlined },
  { title: '动态', icon: AliwangwangOutlined },
  { title: '收藏', icon: StarOutlined },
  { title: '历史', icon: ClockCircleOutlined },
  { title: '创作中心', icon: BulbOutlined }
];
</script>

<style lang="scss" scoped>
/* 
  如果你的项目的编写结构允许，你可以直接把下面的样式直接贴到你的 style.scss 中。
  这里为你写齐了弹窗内一比一还原所需的 Flex 栅格布局和定位样式：
*/

.modal-flex-container {
  display: flex;
  gap: 30px;
  padding: 20px 10px;
  min-height: 260px;
  align-items: center;
}

.popup-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #f0f0f0;
  padding-right: 20px;
  
  .qrcode-tip {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
    .highlight {
      color: #1890ff;
      font-weight: bold;
    }
  }
}

.popup-left-register {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #f0f0f0;
  padding-right: 20px;
  height: 100%;
  
  .register-welcome {
    text-align: center;
    h2 {
      font-size: 24px;
      color: #1890ff;
      margin-bottom: 8px;
      font-weight: 600;
    }
    p {
      color: #999;
      font-size: 13px;
    }
  }
}

.popup-right {
  flex: 1.4;
  
  .form-body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-top: 15px;
  }
  
  .input-item {
    position: relative;
    width: 100%;
    
    .form-input {
      height: 40px;
      border-radius: 6px;
    }
  }
  
  .password-wrapper {
    padding-right: 80px; /* 给眼睛和忘记密码预留绝对定位空间 */
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    background: #fff;
    
    .form-input {
      border: none !important;
      box-shadow: none !important;
      flex: 1;
    }
    
    .eye-icon {
      position: absolute;
      right: 65px;
      cursor: pointer;
      color: #999;
      font-size: 16px;
      transition: color 0.3s;
      &:hover { color: #666; }
    }
    
    .forget-pwd {
      position: absolute;
      right: 10px;
      color: #1890ff;
      cursor: pointer;
      font-size: 12px;
      &:hover { text-decoration: underline; }
    }
  }
}

.code-btn {
  height: 40px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* 维持原有全局或外部引用的 scss */
@import "./style.scss";
</style>