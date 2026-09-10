<template>
<div class="content">
    <div class="content__header">
      <h2 class="content__title">{{ title }}</h2>
      <div class="content__actions">
        <button type="button" class="content__batch" disabled>批量操作</button>
        <input
          class="content__search"
          type="text"
          placeholder="输入关键词"
          disabled
        />
      </div>
    </div>
    <div v-if="followStore.activeKey === 'follows'" class="content__tabs">
      <span class="content__tab is-active">最近关注</span>
      <span class="content__tab is-disabled">最常访问</span>
    </div>
    <div class="content__list">
      <div class="content__grid">
        <FollowUserCard
          v-for="u in followStore.list"
          :key="u.uid"
          :user="u"
          :mode="followStore.activeKey"
          @toggle="onToggle"
        />
      </div>
      <div v-if="followStore.loading" class="content__tip">加载中...</div>
      <div v-else-if="!followStore.list.length" class="content__tip">暂无数据</div>
    </div>
    <div class="content__pager">
      <button
        type="button"
        class="content__btn"
        :disabled="followStore.loading || followStore.page <= 1"
        @click="followStore.prevPage()"
      >
        上一页
      </button>
      <span class="content__page">第 {{ followStore.page }} 页</span>
      <button
        type="button"
        class="content__btn"
        :disabled="followStore.loading || followStore.finished"
        @click="followStore.nextPage()"
      >
        下一页
      </button>
    </div>
  </div>
</template>
<script setup lang="ts" name="FollowContent">
import { ref } from 'vue'
import { computed } from 'vue'
import { useFollowStore } from '../../../../../stores/follow.ts'
import FollowUserCard from './FollowUserCard.vue'

const followStore = useFollowStore();
const title=computed(()=>followStore.activeKey==='follows'?'全部关注':'我的粉丝');
const onToggle=(uid:number)=>{
followStore.toggleFollow(uid)
//这个动作是切换用户关注的一个情况，所以需要重新获取一下数据
}


</script>
<style lang="scss" scoped src="./index.scss">
</style>