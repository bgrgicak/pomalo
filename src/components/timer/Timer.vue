<script setup lang="ts">
import { useTimerStore } from '@/stores/timer';
const timerStore = useTimerStore();
</script>
<template>
    <div class="timer v-card"
         v-if="timerStore.active">
        <span class=" pr-2 timer__label timer__label--title">
            {{ timerStore.title }}
        </span>
        <span class="timer__label">
            {{ timerStore.time }}h
        </span>
        <v-btn @click="timerStore.stop"
               class="timer__button"
               color="error"
               icon="mdi-stop-circle-outline"
               variant="text" />
    </div>
</template>
<style scoped lang="scss">
.timer {
    padding-left: 12px;
}

.timer__label {
    position: relative;
    top: 1px;

    &.timer__label--title {
        font-weight: 500;
    }
}
</style>
