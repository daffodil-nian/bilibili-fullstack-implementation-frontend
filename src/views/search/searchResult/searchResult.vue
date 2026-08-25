<template>

<bilibiliHeader/>
  <div class="search-page">
    <!-- 搜索框区域 -->
    <div class="search-header">
      <div class="search-input-wrap">
        <span class="search-icon">Q</span>
        <input v-model="keyword" type="text" placeholder="请输入搜索内容" />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
    </div>

    <!-- 一级Tab：综合、视频、番剧、影视、直播、专栏、用户 -->
    <div class="tab-wrap">
      <div
        v-for="item in topTabList"
        :key="item.code"
        class="tab-item"
        :class="{ active: activeTopTab === item.code }"
        @click="switchTopTab(item.code)"
      >
        {{ item.label }}
        <span class="count-badge">{{ item.count }}</span>
      </div>
    </div>

    <!-- 二级排序Tab -->
    <div class="sort-tab-wrap">
      <div
        v-for="item in sortTabList"
        :key="item.code"
        class="sort-item"
        :class="{ active: activeSortCode === item.code }"
        @click="switchSort(item.code)"
      >
        {{ item.label }}
      </div>
      <div class="more-filter">更多筛选 ∨</div>
    </div>

    <!-- 搜索结果列表区域 -->
    <div class="result-list">
      <div v-if="loading" class="loading">搜索加载中...</div>
      <div v-if="!loading && resultData.length === 0" class="empty">暂无搜索结果</div>
      <div v-for="item in resultData" :key="item.id" class="video-card">
        <div class="card-cover">封面图</div>
        <div class="card-info">
          <div class="card-title">{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import bilibiliHeader from "../../../components/layout/BilibiliHeader.vue"

// 搜索关键词
const keyword = ref('仿写bilibili')
const loading = ref(false)
interface SearchResultItem{
    id:number,
    title:string
}
const resultData = ref<SearchResultItem[]>([])

// 顶部一级tab
const topTabList = reactive([
  { code: 0, label: '综合', count: '99+' },
  { code: 1, label: '视频', count: '99+' },
  { code: 2, label: '番剧', count: 0 },
  { code: 3, label: '影视', count: 0 },
  { code: 4, label: '直播', count: 0 },
  { code: 5, label: '专栏', count: '99+' },
  { code: 6, label: '用户', count: 0 }
])
const activeTopTab = ref(0)

// 排序tab，和后端枚举对应
const sortTabList = reactive([
  { code: 0, label: '综合排序' },
  { code: 1, label: '最多播放' },
  { code: 2, label: '最新发布' },
  { code: 3, label: '最多弹幕' },
  { code: 4, label: '最多收藏' }
])
const activeSortCode = ref(0)

// 切换一级tab
const switchTopTab = (code:number) => {
  activeTopTab.value = code
  handleSearch()
}

// 切换排序
const switchSort = (code:number) => {
  activeSortCode.value = code
  handleSearch()
}

// 发起搜索请求
const handleSearch = () => {
  loading.value = true
  // todo:调用后端接口
  // axios.get('/api/search',{
  //   params:{
  //     keyword: keyword.value,
  //     tabCode: activeTopTab.value,
  //     sortCode: activeSortCode.value
  //   }
  // }).then(res=>{
  //   resultData.value = res.data.records
  // }).finally(()=>{
  //   loading.value = false
  // })

  // 模拟
  setTimeout(() => {
    resultData.value = []
    loading.value = false
  }, 600)
}
</script>

<style scoped src="./style.scss">

</style>
