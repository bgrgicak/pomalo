<script setup lang="ts">
import { openActivityPage } from '@/data/activities';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type { ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';

import type { PropType } from 'vue';

const props = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  }
});

const state: Ref<ActivityState> = ref({
    activity: Object.assign({}, props.activity) as Activity,
    isEditing: false,
});

const activityStore = useActivityStore();

watch(() => props.activity, (newActivity) => {
    if (undefined === state.value.activity) {
        return;
    }
    if (newActivity._id === state.value.activity._id) {
        return;
    }
    if (state.value.isEditing) {
        if (!confirm(__('You have unsaved changes. Are you sure you want to continue?'))) {
            openActivityPage(state.value.activity);
            return;
        }
    }
    state.value.activity = Object.assign({}, newActivity);
    state.value.isEditing = false;
});

const onKeyup = (event: KeyboardEvent) => {
    if ('Meta' === event.key) {
        // Prevent meta enter save from triggering isEditing
        return;
    }
    state.value.isEditing = true;
};

const save = () => {
    const updatedActivity = Object.assign({}, props.activity);
    updatedActivity.title = state.value.activity.title;
    updatedActivity.description = state.value.activity.description;
    activityStore.update(updatedActivity).then(() => {
        state.value.isEditing = false;
    });
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.metaKey) {
        save();
    }
};
</script>
<template>
  <div @keydown="updateOnCommandEnter">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="state.activity.title"
          :readonly="state.activity.readonly"
          class="activity-title"
          @keyup="onKeyup"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="pb-0"
      >
        <v-textarea
          v-model="state.activity.description"
          :readonly="state.activity.readonly"
          rows="5"
          @keyup="onKeyup"
        />
      </v-col>
    </v-row>
    <v-row
      v-show="state.isEditing"
      v-if="!state.activity.readonly"
      class="mt-0 mb-4"
    >
      <v-col cols="12">
        <v-btn
          color="success"
          block
          @click="save"
        >
          {{ __('Save') }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>