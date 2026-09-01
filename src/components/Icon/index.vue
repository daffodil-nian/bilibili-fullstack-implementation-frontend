<template>

</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useRoute} from "vue-router";

interface Props{
    icon: string,
    size?: number | string,
    rotate?: number | string,
    spin?: boolean,
    colorful?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    size: 16,
});

</script>
<style scoped>

</style>