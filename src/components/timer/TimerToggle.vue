<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import constants from '@/helper/constants';
import { computed } from 'vue';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const timerStore = useTimerStore();

const isActive = computed(() => {
    return timerStore.active && timerStore.activityId === props.activity._id;
});

const start = () => {
    timerStore.start(props.activity._id);
    emit('change');
};
const stop = () => {
    timerStore.stop();
    emit('change');
};
</script>
<template v-if="!timerStore.isLoading">
    <v-btn v-if="!isActive"
           color="primary"
           class="timer-toggle activity-start"
           variant="text"
           @click="start"
           icon="mdi-play-circle-outline" />
    <v-btn v-else
           class="timer-toggle activity-stop"
           variant="text"
           @click="stop"
           icon="mdi-stop-circle-outline" />
</template>