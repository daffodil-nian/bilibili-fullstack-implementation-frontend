<!-- 这个是整页入口 -->
<template>
<FollowPanel/>
</template>

<script setup lang="ts">
import {onBeforeMount} from "vue";
import FollowPanel from "./components/FollowPanel/index.vue";
import {useFollowStore} from "../../stores/follow.ts";

onBeforeMount(()=>{
  console.log('follow xixixi')
  useFollowStore().init();
})

</script>