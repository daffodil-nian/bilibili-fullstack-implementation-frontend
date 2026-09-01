<template>
  <div
    v-for="item in list"
    :key="item.articleId"
    class="video-card article-card"
  >
    <div class="card-cover">
      <img
        v-if="item.cover"
        :src="item.cover"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover"
      />
      <template v-else>封面图</template>
    </div>
    <div class="card-info">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.summary }}</div>
      <div class="card-meta">
        <span>{{ item.authorNickname }}</span>
        <span v-if="item.tag">#{{ item.tag }}</span>
        <span>阅读 {{ item.clickCount ?? 0 }}</span>
        <span>点赞 {{ item.likeCount ?? 0 }}</span>
        <span>评论 {{ item.commentCount ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchArticleItem } from '../../../../services/api'

defineProps<{
  list: SearchArticleItem[]
}>()
</script>
