import { searchAll } from '../../../../services/api'
import type { SearchVideoItem } from '../../../../services/api'
import VideoResultList from '../components/VideoResultList.vue'
import type { SearchFetchParams, SearchStrategy, SortTabItem } from './types'

/** 对齐后端 VideoSortEnum */
const videoSortTabs: SortTabItem[] = [
  { code: 0, label: '综合排序' },
  { code: 1, label: '最多播放' },
  { code: 2, label: '最新发布' },
  { code: 3, label: '最多弹幕' },
  { code: 4, label: '最多收藏' },
]

/**
 * 视频类策略工厂（视频 / 番剧 / 直播 / 帖子 共用 UI，searchType 不同）
 * 后端补齐 videoList 后即可展示
 */
export function createVideoLikeStrategy(
  key: string,
  searchType: number,
): SearchStrategy {
  return {
    key,
    searchType,
    sortTabs: videoSortTabs,
    resultComponent: VideoResultList,
    async fetch(params: SearchFetchParams): Promise<SearchVideoItem[]> {
      const res = await searchAll({
        keyword: params.keyword,
        searchType,
        sortCode: params.sortCode,
        currentNum: params.currentNum ?? 1,
        pageSize: params.pageSize ?? 20,
      })
      return res.data?.videoList ?? []
    },
  }
}
