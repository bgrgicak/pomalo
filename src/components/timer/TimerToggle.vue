<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import { computed } from 'vue';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const timerStore = useTimerStore();

const isActive = computed(() => {
    return timerStore.active && timerStore.activityId === props.activity._id;
});

const start = () => {
    timerStore.start(props.activity._id);
    emit('change', true, props.activity._id);
};
const stop = () => {
    timerStore.stop();
    emit('change', false, props.activity._id);
};
</script>
<template v-if="!timerStore.isLoading">
  <v-btn
    v-if="!isActive"
    color="primary"
    class="timer-toggle activity-start"
    variant="text"
    icon="mdi-play-circle-outline"
    @click="start"
  />
  <v-btn
    v-else
    class="timer-toggle activity-stop"
    variant="text"
    color="error"
    icon="mdi-stop-circle-outline"
    @click="stop"
  />
</template>