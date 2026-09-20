<!-- MsgBubble.vue -->
<template>
  <div class="row" :class="mine ? 'mine' : 'peer'">
    <!-- 还需要表示时间的！ -->
     <div v-if="time" class="time">{{ time }}</div>
    <img v-if="!mine" class="avatar" :src="avatar || ''" alt="" />
    <div class="bubble">{{ content }}</div>
    <img v-if="mine" class="avatar" :src="avatar || ''" alt="" />
  </div>
</template>
<script setup lang="ts">
defineProps<{ 
  content: string;
 mine: boolean ;
 avatar?:string;
 time?:string;}>()
</script>
<style scoped>
.row { display: flex; margin: 8px 12px; }
.peer { justify-content: flex-start; }
.mine { justify-content: flex-end; }
.bubble {
  max-width: 60%;
  padding: 8px 18px;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 8px;
  font-size: 14px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #e3e5e7;
}
.peer .bubble { background: #fff; }
.mine .bubble { background: #00aeec; color: #fff; }
</style>