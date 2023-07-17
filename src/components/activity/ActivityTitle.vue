<script setup lang="ts">
const { activity } = defineProps(['activity']);
</script>
<template>
    <router-link :to="`/${activity.type}/${activity._id}/`" class="activity-title v-btn v-btn--variant-text">
        {{ activity.title }}
    </router-link >
</template>
<style scoped lang="scss">
.activity-title {
    text-transform: unset;
}
</style>