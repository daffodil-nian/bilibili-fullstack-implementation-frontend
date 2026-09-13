<script setup lang="ts" name="FollowUserCard">
// 引入computed属性计算
import {computed,ref} from "vue";
import type { UserSimpleVO } from "../../../../../services/types";

const props = defineProps<{
    user:UserSimpleVO,
    mode:'follows' | 'fans'
}>();

const emit = defineEmits<{
    toggle:[uid:number]
}>();

// 参数定义好就可以拿来用了！

const clicking = ref(false);

//其实我还有一个问题，就是如果关注了再点击这个会不会是取关的呀，我知道了这不是按按钮关注的意思，而是判断是否关注了的！
const btnText=computed(()=>{
    // if(props.mode==='follows'){
    //     return '已关注!!';
    // }
    // return props.user.followed?'已关注':'关注';

    if(props.user.isMutualFollow){
      return '已互粉'
    }
    if(props.user.followed){
      return '已关注'
    }
    else return '关注'
})

const handleClick = () =>{
    if(clicking.value) return;
    emit('toggle',props.user.uid);
    
}

const btnClass = computed(() => ({
  'follow-card__btn': true,
  'is-primary': props.mode === 'fans' && !props.user.followed,
  'is-plain': !(props.mode === 'fans' && !props.user.followed),
}))
</script>
<template>
 <div class="follow-card">
    <a-avatar class="follow-card__avatar" :size="80" :src="user.avatar || undefined">
      {{ user.nickname?.slice(0, 1) }}
    </a-avatar>
    <div class="follow-card__body">
      <div class="follow-card__name">
        {{ user.nickname || '用户' + user.uid }}
      </div>
      <div class="follow-card__sign">
        {{ user.signature || '这个人没有填简介啊~~~' }}
      </div>
      <button
        type="button"
        :class="btnClass"
        :disabled="clicking"
        @click="handleClick"
      >
        {{ btnText }}
      </button>
    </div>
  </div>

</template>

<style scoped lang="scss" src="./FollowUserCard.scss">
</style>