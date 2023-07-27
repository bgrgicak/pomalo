<script setup lang="ts">
import __ from '@/helper/translations';
import { useTimerStore } from '@/stores/timer';
import constants from '@/helper/constants';

const props = defineProps(['activity']);

const timerStore = useTimerStore();
</script>
<template v-if="!timerStore.isLoading">
    <v-btn v-if="!timerStore.active"
           color="primary"
           class="activity-start"
           variant="outlined"
           @click="() => timerStore.start(props.activity._id)"
           append-icon="mdi-play-circle-outline">
        {{ __('Start timer') }}
    </v-btn>
    <v-btn v-else
           class="activity-stop"
           variant="outlined"
           @click="timerStore.stop"
           append-icon="mdi-stop-circle-outline">
        {{ __('Stop timer') }}
    </v-btn>
</template>
<style scoped lang="scss">
.activity-start,
.activity-stop {
    width: 100%;
}
</style>