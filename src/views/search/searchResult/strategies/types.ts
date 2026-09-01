import type { Component } from 'vue'

export interface SortTabItem {
  code: number
  label: string
}

export interface SearchFetchParams {
  keyword: string
  sortCode: number
  currentNum?: number
  pageSize?: number
}

/**
 * 每种搜索 Tab 的策略：
 * - searchType：后端枚举；null 表示暂未开放
 * - sortTabs：该类型专属排序
 * - resultComponent：结果列表组件
 * - fetch：请求并解析成该类型的列表
 */
export interface SearchStrategy {
  /** 策略标识，便于调试 */
  key: string
  searchType: number | null
  sortTabs: SortTabItem[]
  resultComponent: Component
  /** 未开放时的空态文案 */
  unsupportedText?: string
  fetch(params: SearchFetchParams): Promise<unknown[]>
}
