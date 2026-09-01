<template>
  <bilibiliHeader />
  <div class="search-page">
    <div class="search-header">
      <div class="search-input-wrap">
        <span class="search-icon">Q</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="请输入搜索内容"
        
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
    </div>

    <div class="tab-wrap">
      <div
        v-for="item in topTabList"
        :key="item.code"
        class="tab-item"
        :class="{ active: activeTopTab === item.code }"
        @click="switchTopTab(item.code)"
      >
        {{ item.label }}
        <span class="count-badge">{{ formatCount(item.count) }}</span>
      </div>
    </div>

    <div class="sort-tab-wrap">
      <div
        v-for="item in currentStrategy.sortTabs"
        :key="item.code"
        class="sort-item"
        :class="{ active: activeSortCode === item.code }"
        @click="switchSort(item.code)"
      >
        {{ item.label }}
      </div>
      <div class="more-filter">更多筛选 ∨</div>
    </div>

    <div class="result-list">
      <div v-if="loading" class="loading">搜索加载中...</div>
      <div v-else-if="resultList.length === 0" class="empty">{{ emptyText }}</div>
      <component
        :is="currentStrategy.resultComponent"
        v-else
        :list="resultList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import bilibiliHeader from '../../../components/layout/BilibiliHeader.vue'
import {
  getStrategy,
  SearchTab,
  topTabMeta,
  type SearchStrategy,
} from './strategies'

const route = useRoute()

const keyword = ref('')
const loading = ref(false)
const activeTopTab = ref<number>(SearchTab.ALL)
const activeSortCode = ref(0)
const resultList = ref<unknown[]>([])

const topTabList = reactive(
  topTabMeta.map((t) => ({
    code: t.code,
    label: t.label,
    count: 0 as number | string,
  })),
)

const currentStrategy = computed<SearchStrategy>(() => getStrategy(activeTopTab.value))

const emptyText = computed(() => {
  if (currentStrategy.value.searchType == null) {
    return currentStrategy.value.unsupportedText || '该分类暂未开放搜索'
  }
  if (!keyword.value.trim()) return '请输入搜索关键词'
  return '暂无搜索结果'
})

const formatCount = (count: number | string) => {
  if (typeof count === 'string') return count
  if (count > 99) return '99+'
  return count
}

const updateTabCount = (tabCode: number, count: number) => {
  const tab = topTabList.find((t) => t.code === tabCode)
  if (tab) tab.count = count
}

const switchTopTab = (code: number) => {
  if (activeTopTab.value === code) return
  activeTopTab.value = code
  activeSortCode.value = 0
  resultList.value = []
  handleSearch()
}

const switchSort = (code: number) => {
  if (activeSortCode.value === code) return
  activeSortCode.value = code
  handleSearch()
}

/** 页面只调度策略，不关心 userList / articleList 差异 */
const handleSearch = async () => {
  const kw = keyword.value.trim()
  const strategy = currentStrategy.value
  resultList.value = []
  
  if (!kw || strategy.searchType == null) return

  loading.value = true
  try {
    const list = await strategy.fetch({
      keyword: kw,
      sortCode: activeSortCode.value,
      currentNum: 1,
      pageSize: 20,
    })
    resultList.value = list
    updateTabCount(activeTopTab.value, list.length)
  } catch (e) {
    console.error('搜索失败', e)
    resultList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const q = route.query.keyword
  if (typeof q === 'string' && q.trim()) {
    keyword.value = q.trim()
  }
  const tab = route.query.tab
  if (typeof tab === 'string' && tab !== '') {
    const tabNum = Number(tab)
    if (!Number.isNaN(tabNum) && getStrategy(tabNum)) {
      activeTopTab.value = tabNum
    }
  }
  if (keyword.value.trim()) {
    handleSearch()
  }
})
</script>

<style scoped src="./style.scss"></style>
