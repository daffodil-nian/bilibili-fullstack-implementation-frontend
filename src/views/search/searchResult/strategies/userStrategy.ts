import { SearchType, searchAll } from '../../../../services/api'
import type { SearchUserItem } from '../../../../services/api'
import UserResultList from '../components/UserResultList.vue'
import type { SearchFetchParams, SearchStrategy, SortTabItem } from './types'

/** 对齐后端 UserSortEnum */
const userSortTabs: SortTabItem[] = [
  { code: 0, label: '默认排序' },
  { code: 1, label: '粉丝多到少' },
  { code: 2, label: '粉丝少到多' },
  { code: 3, label: '等级高到低' },
  { code: 4, label: '等级低到高' },
]

export const userStrategy: SearchStrategy = {
  key: 'user',
  searchType: SearchType.USER,
  sortTabs: userSortTabs,
  resultComponent: UserResultList,
  async fetch(params: SearchFetchParams): Promise<SearchUserItem[]> {
    const res = await searchAll({
      keyword: params.keyword,
      searchType: SearchType.USER,
      sortCode: params.sortCode,
      currentNum: params.currentNum ?? 1,
      pageSize: params.pageSize ?? 20,
    })
    return res.data?.userList ?? []
  },
}
