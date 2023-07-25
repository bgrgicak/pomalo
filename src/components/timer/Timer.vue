<script setup lang="ts">
import { useTimerStore } from '@/stores/timer';
const timerStore = useTimerStore();
timerStore.getCurrent();
</script>
<template>
    <div class="timer"
         v-if="timerStore.active">
        <v-btn @click="timerStore.stop"
               class="timer__button"
               icon="mdi-stop-circle-outline"
               variant="text" />
        <label class="timer__label">
            {{ timerStore.time }}
        </label>
    </div>
</template>
<style scoped lang="scss">
.timer {
    margin: 4px 1.2rem;
}

.timer__label {
    position: relative;
    top: 1px;
}
</style>
