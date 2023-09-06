<script setup lang="ts">
import { useTimerStore } from '@/stores/timer';
import { getActivityLink } from '@/data/activities';
const timerStore = useTimerStore();
</script>
<template>
  <div
    v-if="timerStore.active"
    class="timer v-card pl-0"
  >
    <v-btn
      class="timer__label--title"
      variant="plain"
      :to="timerStore.currentActivity ? getActivityLink(timerStore.currentActivity) : undefined"
    >
      {{ timerStore.title }}
    </v-btn>
    <span class="timer__label">
      {{ timerStore.time }}
    </span>
    <v-btn
      class="timer__button"
      color="error"
      icon="mdi-stop-circle-outline"
      variant="text"
      @click="timerStore.stop"
    />
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
        font-size: 0.75rem;
        min-width: 3rem;
    }
}

.timer__label {
    position: relative;
    top: 1px;
    opacity: var(--v-medium-emphasis-opacity);
}
</style>
