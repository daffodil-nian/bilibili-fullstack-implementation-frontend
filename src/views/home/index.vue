<script setup lang="ts">
import HeaderBanner from '../../components/header/index.vue'
import BilibiliHeader from '../../components/layout/BilibiliHeader.vue'

/** 首页头图高度，改这里时 Header 滚动变色阈值会一起对齐 */
const bannerHeight = 155
</script>

<template>
  <div class="home-top">
    <HeaderBanner :height="bannerHeight" />
    <div class="home-nav">
      <BilibiliHeader :with-banner="true" :banner-height="bannerHeight" />
    </div>
  </div>
  <!-- 占位内容，方便向下滚动测试导航变色；后面换成真正首页内容即可 -->
  <div class="home-body"></div>
</template>

<style scoped src="../home/style.scss">
</style>
