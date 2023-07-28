<script setup lang="ts">
const props = defineProps(['activity', 'disabled']);
</script>
<template>
    <router-link :to="`/${props.activity.type}/${props.activity._id}/`"
                 :class="{ 'activity-title--disabled': props.disabled }"
                 class="activity-title v-btn v-btn--variant-text">
        {{ props.activity.title }}
    </router-link>
</template>
<style scoped lang="scss">
.activity-title {
    text-transform: unset;

    &.activity-title--disabled {
        pointer-events: none;
    }
}
</style>