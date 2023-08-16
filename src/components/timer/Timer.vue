<script setup lang="ts">
import { useTimerStore } from '@/stores/timer';
import { getActivityLink } from '@/data/activities';
const timerStore = useTimerStore();
</script>
<template>
    <div class="timer v-card pl-0"
         v-if="timerStore.active">
        <v-btn class="timer__label--title"
               variant="plain"
               :to="timerStore.currentActivity ? getActivityLink(timerStore.currentActivity) : undefined">
            Long name for a task
        </v-btn>
        <span class="timer__label">
            {{ timerStore.time }}
        </span>
        <v-btn @click="timerStore.stop"
               class="timer__button"
               color="error"
               icon="mdi-stop-circle-outline"
               variant="text" />
    </div>
</template>
<style lang="scss">
.timer {
    padding-left: 12px;
}

.timer__label--title {
    max-width: calc(100% - 115px);

    .v-btn__content {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-align: left;
        display: inline-block;
    }
}

.timer__label {
    position: relative;
    top: 1px;
    opacity: var(--v-medium-emphasis-opacity);
}
</style>
