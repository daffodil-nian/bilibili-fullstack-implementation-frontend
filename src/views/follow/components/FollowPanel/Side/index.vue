<template>
  <aside class="side">
    <!-- ===== 我的关注 ===== -->
    <div class="side__title">我的关注</div>
    <button type="button" class="side__create" disabled>
      <PlusOutlined />
      <span>新建分组</span>
    </button>
    <ul class="side__menu">
      <!-- 能点：全部关注 -->
      <li
        class="side__item"
        :class="{ 'is-active': followStore.activeKey === 'follows' }"
        @click="handleSwitch('follows')"
      >
      <!-- 然后点击全部关注右边的值也要跟着渲染！ -->
        <span class="side__item-left">
          <TeamOutlined class="side__icon" />
          <span>全部关注</span>
        </span>
        <span class="side__count">{{ followCount }}</span>
      </li>
      <!-- 下面三个：截图有，后端没有，先占位 -->
      <li class="side__item is-disabled">
        <span class="side__item-left">
          <HeartOutlined class="side__icon" />
          <span>特别关注</span>
        </span>
        <span class="side__count">0</span>
      </li>
      <li class="side__item is-disabled">
        <span class="side__item-left">
          <UserOutlined class="side__icon" />
          <span>悄悄关注</span>
        </span>
        <span class="side__count">0</span>
      </li>
      <li class="side__item is-disabled">
        <span class="side__item-left">
          <UserOutlined class="side__icon" />
          <span>默认分组</span>
        </span>
        <span class="side__count">{{ followCount }}</span>
      </li>
    </ul>
    <div class="side__divider" />
    <!-- ===== 我的粉丝 ===== -->
    <div class="side__title">我的粉丝</div>
    <ul class="side__menu">
      <li
        class="side__item"
        :class="{ 'is-active': followStore.activeKey === 'fans' }"
        @click="handleSwitch('fans')"
      >
        <span class="side__item-left">
          <CheckCircleOutlined class="side__icon" />
          <span>我的粉丝</span>
        </span>
        <span class="side__count">{{ fansCount }}</span>
      </li>
       <div class="side__divider" />
    </ul>
  </aside>
</template>

<script setup lang="ts" name="FollowSide">
import {computed} from "vue";//计算属性
import {useFollowStore} from "../../../../../stores/follow";
import {getUserInfo} from "../../../../../services/userStorage"
import {
  PlusOutlined,
  TeamOutlined,
  HeartOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue'

const followStore = useFollowStore()
/** 人数：和空间页右上角一样，读登录用户本地信息（不要写 followStore.followCount） */

//计算用户的个数，可以在getUserInfo()中获取
// const followCount = computed(
//   () => getUserInfo()?.userFollowInfo?.followCount ?? 0,
// )
// const fansCount = computed(
//   () => getUserInfo()?.userFollowInfo?.fansCount ?? 0,
// )


const currentUser = computed(() => getUserInfo())
const followCount =computed(()=>followStore.myFollowCount!=0?
followStore.myFollowCount:
currentUser.value?.userFollowInfo?.followCount??0)
const fansCount =computed(()=>followStore.myFansCount!=0?
followStore.myFansCount:
currentUser.value?.userFollowInfo?.fansCount??0)

/** 点「全部关注 / 我的粉丝」→ store 去拉列表 */
const handleSwitch = (key: 'follows' | 'fans') => {
  followStore.switchSide(key)
}
</script>
<style scoped lang="less" src="./index.scss"></style>