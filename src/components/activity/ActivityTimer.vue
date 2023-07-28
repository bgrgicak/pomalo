<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import { computed } from 'vue';

const props = defineProps(['activity']);

const timerStore = useTimerStore();

const isActive = computed(() => {
    return timerStore.active && timerStore.activityId === props.activity._id;
});
</script>
<template v-if="!timerStore.isLoading">
    <v-btn v-if="isActive"
           class="activity-stop"
           variant="outlined"
           @click="timerStore.stop"
           append-icon="mdi-stop-circle-outline">
        {{ __('Stop timer') }}
    </v-btn>
    <v-btn v-else
           color="primary"
           class="activity-start"
           variant="outlined"
           @click="() => timerStore.start(props.activity._id)"
           append-icon="mdi-play-circle-outline">
        {{ __('Start timer') }}
    </v-btn>
</template>
<style scoped lang="scss">
.activity-start,
.activity-stop {
    width: 100%;
}
</style>