<script setup lang="ts">
defineProps<{
  visible: boolean
  x: number
  y: number
}>()

const emit = defineEmits<{
  close: []
  withdraw: []
}>()

function onWithdraw() {
  emit('withdraw')
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="ctx-mask"
      @click="emit('close')"
      @contextmenu.prevent="emit('close')"
    >
      <div class="ctx-menu" :style="{ left: x + 'px', top: y + 'px' }" @click.stop>
        <div class="ctx-item" @click="onWithdraw">撤回</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ctx-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
}
.ctx-menu {
  position: fixed;
  min-width: 96px;
  padding: 4px;
  background: #fff;
  border: 1px solid #e3e5e7;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  z-index: 2001;
}
.ctx-item {
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  font-size: 13px;
  color: #61666d;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.ctx-item:hover {
  background: #fff5f8;
  color: #fb7299;
}
</style>