<script setup lang="ts">

import BilibiliHeader from "../../components/layout/BilibiliHeader.vue";
import {SearchOutlined} from "@ant-design/icons-vue";
import {ref,computed} from "vue";
import { vClickOutside } from "../../directives/clickOutside.ts";
const inputText=ref<string>();
const isFocusInput=ref<boolean>(false);
const handleFocus=()=>{
  isFocusInput.value=true
}
const handleBlur = () => {
  if(isFocusInput.value)
  isFocusInput.value = false;
};
</script>

<template>
  <BilibiliHeader/>
  <div class="search-box" >
    <div class="search-input-wrap flex-between" v-click-outside="handleBlur">
      <SearchOutlined class="search-icon" />
      <a-input v-model:value="inputText" placeholder="输入关键词搜索" class="search-input" :bordered="false" @focus="handleFocus" >
      </a-input>
      <a-button class="nav-item-button">
        搜索
      </a-button>
      <div class="search-panel" v-if="isFocusInput">
        222
        <div class="history">
        </div>
        <div class="trending">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./style.scss" scoped />