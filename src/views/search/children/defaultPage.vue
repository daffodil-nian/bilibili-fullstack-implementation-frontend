<template>
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

<script setup>
import { ref, reactive } from 'vue'

// 搜索关键词
const keyword = ref('仿写bilibili')
const loading = ref(false)
const resultData = ref([])

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
const switchTopTab = (code) => {
  activeTopTab.value = code
  handleSearch()
}

// 切换排序
const switchSort = (code) => {
  activeSortCode.value = code
  handleSearch()
}

// 发起搜索请求
const handleSearch = () => {
  console.log("12121")
   console.log('搜索关键词:', keyword.value)
  loading.value = true
  todo:调用后端接口
  axios.get('/api/search',{
    params:{
      keyword: keyword.value,
      tabCode: activeTopTab.value,
      sortCode: activeSortCode.value
    }
  }).then(res=>{
    if(activeTopTab.value === 6){
 
resultData.value = res.data.userList || []
    }
    else {
      resultData.value =  []
    }
    
  }).finally(()=>{
    loading.value = false
  })
  console.log('搜索关键词:', keyword.value)
  console.log(resultData.value)
  // // 模拟
  // setTimeout(() => {
  //   resultData.value = []
  //   loading.value = false
  // }, 600)
}
</script>

<style scoped>
.search-page {
  padding: 24px 40px;
}
.search-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  background: #f5f6f7;
  border-radius: 12px;
  padding: 0 16px;
  width: 520px;
  height: 52px;
}
.search-icon {
  color: #00a1d6;
  font-size: 22px;
  margin-right: 8px;
}
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 22px;
}
.search-btn {
  background-color: #00a1d6;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0 36px;
  height: 44px;
  font-size: 24px;
  cursor: pointer;
}

.tab-wrap {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 16px;
}
.tab-item {
  padding: 14px 24px;
  font-size: 32px;
  color: #666;
  cursor: pointer;
  position: relative;
}
.tab-item.active {
  color: #00a1d6;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 12px;
  right: 12px;
  height: 4px;
  background-color: #00a1d6;
  border-radius: 2px;
}
.count-badge {
  font-size: 20px;
  color: #999;
  margin-left: 6px;
}

.sort-tab-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}
.sort-item {
  padding: 10px 30px;
  font-size: 30px;
  color: #666;
  cursor: pointer;
  border-radius: 16px;
}
.sort-item.active {
  background-color: #e6f7ff;
  color: #00a1d6;
}
.more-filter {
  margin-left: auto;
  border: 1px solid #ccc;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
}

.result-list {
  margin-top: 20px;
}
.video-card {
  display: flex;
  margin-bottom: 20px;
}
.card-cover {
  width: 220px;
  height: 130px;
  background: #ddd;
  border-radius: 8px;
  margin-right: 16px;
}
.loading,.empty {
  text-align: center;
  padding: 40px;
  font-size: 26px;
  color:#888;
}
</style>
