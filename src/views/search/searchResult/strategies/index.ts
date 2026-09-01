import { SearchType } from '../../../../services/api'
import { articleStrategy } from './articleStrategy'
import { createUnsupportedStrategy } from './unsupportedStrategy'
import { userStrategy } from './userStrategy'
import { createVideoLikeStrategy } from './videoStrategy'
import type { SearchStrategy } from './types'

/** 前端一级 Tab code（与页面展示顺序一致） */
export const SearchTab = {
  ALL: 0,
  VIDEO: 1,
  ANIME: 2,
  MOVIE: 3,
  LIVE: 4,
  COLUMN: 5,
  USER: 6,
} as const

export type SearchTabCode = (typeof SearchTab)[keyof typeof SearchTab]

export const topTabMeta = [
  { code: SearchTab.ALL, label: '综合' },
  { code: SearchTab.VIDEO, label: '视频' },
  { code: SearchTab.ANIME, label: '番剧' },
  { code: SearchTab.MOVIE, label: '影视' },
  { code: SearchTab.LIVE, label: '直播' },
  { code: SearchTab.COLUMN, label: '专栏' },
  { code: SearchTab.USER, label: '用户' },
] as const

/**
 * Tab → 策略注册表
 * 以后加类型：写 strategy + 列表组件，再在这里挂一行即可
 */
export const strategyMap: Record<number, SearchStrategy> = {
  [SearchTab.ALL]: createUnsupportedStrategy('all'),
  [SearchTab.VIDEO]: createVideoLikeStrategy('video', SearchType.VIDEO),
  [SearchTab.ANIME]: createVideoLikeStrategy('anime', SearchType.ANIME),
  [SearchTab.MOVIE]: createUnsupportedStrategy('movie'),
  [SearchTab.LIVE]: createVideoLikeStrategy('live', SearchType.LIVE),
  [SearchTab.COLUMN]: articleStrategy,
  [SearchTab.USER]: userStrategy,
}

export function getStrategy(tabCode: number): SearchStrategy {
  return strategyMap[tabCode] ?? createUnsupportedStrategy('unknown')
}

export type { SearchStrategy, SortTabItem, SearchFetchParams } from './types'
