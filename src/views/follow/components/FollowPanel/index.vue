<!-- 这个是整页入口 -->
<script setup lang="ts" name="FollowPanel">
import Side from "../FollowPanel/Side/index.vue"
import Content from "../FollowPanel/Content/index.vue"
</script>
<template>
<div class="follow-page">
<Side/>
<Content/>
</div>
</template>

<style lang="scss" scoped>
.follow-page {
  display: flex;
  width: 100%;
  min-height: 520px;
}




</style>