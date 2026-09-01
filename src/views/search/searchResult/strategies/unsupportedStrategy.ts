import VideoResultList from '../components/VideoResultList.vue'
import type { SearchStrategy, SortTabItem } from './types'

const emptySortTabs: SortTabItem[] = [{ code: 0, label: '综合排序' }]

/** 后端暂无对应 SearchType 的 Tab（综合 / 影视） */
export function createUnsupportedStrategy(
  key: string,
  text = '该分类暂未开放搜索',
): SearchStrategy {
  return {
    key,
    searchType: null,
    sortTabs: emptySortTabs,
    resultComponent: VideoResultList,
    unsupportedText: text,
    async fetch() {
      return []
    },
  }
}
