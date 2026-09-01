<template>
  <div
    v-for="item in list"
    :key="item.videoId"
    class="video-card"
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
      <div class="card-meta">
        <span>{{ item.authorNickname }}</span>
        <span>播放 {{ item.playCount ?? 0 }}</span>
        <span>弹幕 {{ item.danmakuCount ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchVideoItem } from '../../../../services/api'

defineProps<{
  list: SearchVideoItem[]
}>()
</script>
