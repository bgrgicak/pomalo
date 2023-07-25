<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import Timer from '@/components/timer/Timer.vue';
import constants from '@/helper/constants';

const props = defineProps(['activity']);

const timerStore = useTimerStore();
</script>
<template>
    <v-btn v-if="!timerStore.active"
           :color="constants.colors.primary"
           class="activity-start"
           variant="outlined"
           @click="() => timerStore.start(props.activity._id)"
           prepend-icon="mdi-play-circle-outline">
        {{ __('Start working') }}
    </v-btn>
    <Timer />
</template>
<style scoped lang="scss">
.activity-start {
    width: 100%;
}
</style>