<script setup lang="ts">
import { openActivityPage } from '@/data/activities';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type { ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';
import type { PropType } from 'vue';
import TextEditor from '../ui/TextEditor.vue';
import { useNoticeStore } from '@/stores/notices';
import { NoticeType } from '@/types/notice';
import { useKeyboardStore } from '@/stores/keyboard';

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
const keyboardStore = useKeyboardStore();

watch(() => props.activity, (newActivity) => {
	if (undefined === state.value.activity) {
		return;
	}
	if (newActivity?._id === state.value.activity._id) {
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
	if (keyboardStore.cmdCtrl) {
		// Prevent meta enter save from triggering isEditing
		return;
	}
	state.value.isEditing = true;
};

const save = () => {
	activityStore.updateFields(
		props.activity._id,
		{
			title: state.value.activity.title,
			description: state.value.activity.description,
		},
	).then(() => {
		state.value.isEditing = false;
		useNoticeStore().addNotice({
			title: __('Saved'),
			type: NoticeType.Success,
		});
	});
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
	if (event.key === 'Enter' && keyboardStore.cmdCtrl) {
		save();
	}
};

const updateDescription = (description: string) => {
	state.value.activity.description = description;
	state.value.isEditing = true;
};
</script>
<template>
  <div
    @keydown="updateOnCommandEnter"
    @keyup="onKeyup"
  >
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
        <text-editor
          v-model:model-value="state.activity.description"
          :readonly="state.activity.readonly"
          @update:model-value="updateDescription"
          @paste="state.isEditing = true"
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
<style scoped lang="scss">
.activity-description {
  max-height: 60vh;
  overflow-y: auto;
}
</style>