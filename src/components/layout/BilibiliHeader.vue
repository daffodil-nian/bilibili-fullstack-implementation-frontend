<template>

 <a-config-provider
 :theme="{
  token:{
    colorPrimary:themeColor
  }
 }"
 >
  <div class="nav-box">
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
    <div class="nav-avatar-container">
      <!-- 点击头像：默认打开登录界面 ('1') -->
      <a-avatar size="large" class="nav-avatar" @click="showModel('1')">
        登录
      </a-avatar>
      
      <!-- 鼠标悬浮的快捷登录提示框 -->
      <div class="login-tooltip">
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
          <!-- 点击点我注册：直接打开注册界面 ('3') -->
          <span class="register" @click="showModel('3')">点我注册</span>
        </div>
      </div>

      <!-- 登录/注册二合一模态弹窗 -->
      <div class="popup-page">
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
  EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons-vue'
import { ref, reactive, computed,onMounted } from 'vue';

// 基础变量
const userName = ref<string>('');
const open = ref<boolean>(false);
const activeKey = ref<string>('1'); // '1': 密码登录, '2': 短信登录, '3': 账号注册
const qrcodeUrl = ref<string>('https://im.qq.com/'); // 二维码解析地址


const themeColor = ref('#26BAEF');

onMounted(() => {
  // 2. 获取文档根节点（也就是 :root）的计算样式
  const rootStyles = window.getComputedStyle(document.documentElement);
  
  // 3. 读取你定义的 CSS 变量值，并去掉两边的空格
  const colorFromCss = rootStyles.getPropertyValue('--primary-color').trim();
  
  // 4. 如果成功读取到了，就赋值给响应式变量，驱动组件库变色
  if (colorFromCss) {
    themeColor.value = colorFromCss;
  }
});

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

// 处理底部主按钮（确定/登录/注册）点击事件
const handleOk = (e: MouseEvent) => {
  console.log('点击了主提交按钮事件:', e);
  if (isRegisterMode.value) {
    // 1. 执行注册提交逻辑
    if (!registerForm.username || !registerForm.password) {
      alert('请填写完整的注册信息！');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('两次输入的密码不一致，请重新检查！');
      return;
    }
    console.log('【发起注册请求】数据提交中:', (registerForm));

    //这里要调用登录注册接口

    // 注册成功后的业务逻辑...
  } else {
    // 2. 执行登录提交逻辑
    if (activeKey.value === '1') {
      console.log('【账号密码登录】验证中:', (pwdForm));
    } else {
      console.log('【验证码登录】验证中:', (smsForm));
    }
  }
  // 模拟请求成功后关闭弹窗
  open.value = false;
};

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