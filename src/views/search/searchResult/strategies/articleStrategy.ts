import { SearchType, searchAll } from '../../../../services/api'
import type { SearchArticleItem } from '../../../../services/api'
import ArticleResultList from '../components/ArticleResultList.vue'
import type { SearchFetchParams, SearchStrategy, SortTabItem } from './types'

/** 对齐后端 ArticleSortEnum */
const articleSortTabs: SortTabItem[] = [
  { code: 0, label: '综合排序' },
  { code: 1, label: '最新发布' },
  { code: 2, label: '最多点击' },
  { code: 3, label: '最多点赞' },
  { code: 4, label: '最多评论' },
]

export const articleStrategy: SearchStrategy = {
  key: 'article',
  searchType: SearchType.ARTICLE,
  sortTabs: articleSortTabs,
  resultComponent: ArticleResultList,
  async fetch(params: SearchFetchParams): Promise<SearchArticleItem[]> {
    const res = await searchAll({
      keyword: params.keyword,
      searchType: SearchType.ARTICLE,
      sortCode: params.sortCode,
      currentNum: params.currentNum ?? 1,
      pageSize: params.pageSize ?? 20,
    })
    return res.data?.articleList ?? []
  },
}
