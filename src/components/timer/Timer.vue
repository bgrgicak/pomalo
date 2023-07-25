<script setup lang="ts">
import { useTimerStore } from '@/stores/timer';
const timerStore = useTimerStore();
</script>
<template>
    <div class="timer"
         v-if="timerStore.active">
        <label class="timer__label">
            {{ timerStore.time }}
        </label>
        <v-btn @click="timerStore.stop"
               class="timer__button"
               icon="mdi-stop-circle-outline"
               variant="text" />
    </div>
</template>
<style scoped lang="scss">
.timer {
    margin-left: 12px;
}

.timer__label {
    position: relative;
    top: 1px;
}
</style>
