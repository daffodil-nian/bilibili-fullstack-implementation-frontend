# 前言

【学习参考网站】

https://github.com/zongzibinbin/MallChatWeb





------



# DAY 1

1. `mallchatweb/src/main.ts`

2. `mallchatweb/src/App.vue`

3. `mallchatweb/src/router/index.ts`

4. ```
   mallchatweb/src/
   ```

   下面这一层文件夹（只认名字，先别往里钻）：

   - `components/`
   - `views/`
   - `stores/`
   - `services/`
   - `hooks/`
   - `router/`
   - `enums/`
   - `directives/`
   - `utils/`
   - `constant/`
   - `styles/`
   - `assets/`

今日学习目录如上所示。



https://element-plus.org/en-US/guide/dark-mode

https://router.vuejs.org/zh/introduction.html

https://cn.vuejs.org/guide/introduction.html

https://router.vuejs.org/zh/guide/advanced/router-view-slot.html#RouterView-%E6%8F%92%E6%A7%BD

上面的官方文档是Element 暗色 CSS 变量，让组件库的按钮、弹层和聊天深色界面更搭

我们可以学习一下这段代码

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
// 全局导入 toast 样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
// element dark 模式
import 'element-plus/theme-chalk/dark/css-vars.css'
</script>

<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
.app-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url('@/assets/login_bg.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

@supports (background-image: url('@/assets/login_bg.webp')) {
  .app-wrapper {
    background-image: url('@/assets/login_bg.webp');
  }
}
</style>
```

- **嵌套路由映射**：支持页面内嵌套子页面，后台管理侧边栏 + 右侧内容就是典型用法。
- **动态路由选择**：一条页面组件可以匹配多种网址，依据地址里的标识展示对应数据。
- **模块化、基于组件的路由配置**：路由和页面组件绑定，项目变大后可以拆分文件方便维护。
- **路由参数、查询、通配符**：能从 url 拿到参数，也可以捕获无效地址跳转到 404 页面。
- **展示由 Vue.js 的过渡系统提供的过渡效果**：页面切换时可以加上淡入滑动这类过渡动画，跳转观感更顺滑。
- **细致的导航控制**：页面跳转前可以做拦截校验，比如未登录直接跳转到登录页。
- **自动激活 CSS 类的链接**：导航菜单选中时自动加上样式类，不用手写代码实现菜单高亮。
- **HTML5 history 模式或 hash 模式**：两种 url 格式可选，history 地址干净，hash 部署简单不容易踩坑。
- **可定制的滚动行为**：可以自定义跳转后的滚动条位置，返回页面时恢复之前浏览位置。
- **URL 的正确编码**：自动处理 url 里中文、特殊符号，避免链接出现乱码问题。

上面是vue-router的介绍

那么上面的代码用到了啥？其实用到了 **插槽**，这里解释一下插槽是干啥的吧！



