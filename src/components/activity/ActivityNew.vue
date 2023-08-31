<script setup lang="ts">
import __ from '@/helper/translations';
import Search from '../search/Search.vue';
import type { PropType } from 'vue';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import { computed } from 'vue';
import TextEditor from '../ui/TextEditor.vue';
import ActivityStartDate from './ActivityStartDate.vue';
import ActivityDueDate from './ActivityDueDate.vue';
import { emptyActivity } from '@/data/activities';

const props = defineProps({
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined,
	},
	openInSidebar: {
		type: Boolean,
		default: false,
	},
	type: {
		type: String as PropType<ActivityType>,
		default: undefined,
	},
	visible: {
		type: Boolean,
		default: false,
	},
});

const title = computed(() => {
	let title = __('title');
	if (props.type) {
		title = props.type + ' ' +  title;
	}
	title = title[0].toUpperCase() + title.slice(1);
	return title;
});

const fakeActivity = emptyActivity(ActivityType.Event);
</script>
<template>
  <v-row class="new-activity">
    <v-col cols="12">
      <Search
        :open-in-sidebar="props.openInSidebar"
        :event="props.event"
        :new-types="props.type ? [props.type] : undefined"
        :autofocus="true"
        :placeholder="title"
        :visible="true"
        :hide-icon="true"
      />
    </v-col>
  </v-row>
  <v-row class="blur">
    <v-col cols="12">
      <text-editor
        model-value=""
        class="activity-description"
        :readonly="true"
      />
    </v-col>
  </v-row>
  <v-row class="blur">
    <v-col
      cols="12"
    >
      <ActivityStartDate :activity="fakeActivity" />
      <ActivityDueDate :activity="fakeActivity" />
    </v-col>
  </v-row>
</template>
<style lang="scss">
.blur {
	filter: blur(2px);
	opacity: 0.7;
	pointer-events: none;
}
</style>