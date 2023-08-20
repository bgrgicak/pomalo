<script setup lang="ts">
import { ActivityType, type ActivityEvent } from '@/types/activity';
import __ from '@/helper/translations';
import TaskDetails from '../task/TaskDetails.vue';
import TaskSidebar from '../task/TaskSidebar.vue';
import { computed, type PropType } from 'vue';
import ActivityContent from './ActivityContent.vue';
import ActivityNew from './ActivityNew.vue';
import EventSidebar from '@/components/event/EventSidebar.vue';
import ProjectSidebar from '@/components/project/ProjectSidebar.vue';
import type Activity from '@/types/activity';
import ProjectDetails from '../project/ProjectDetails.vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		default: undefined,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined,
	},
	small: {
		type: Boolean,
		default: false,
	},
	type: {
		type: String as PropType<ActivityType>,
		default: undefined,
	},
});

const isNew = computed(() => {
	return undefined === props.activity;
});
const isTask = computed(() => {
	return props.activity && ActivityType.Task === props.activity.type;
});
const isEvent = computed(() => {
	return props.activity && ActivityType.Event === props.activity.type;
});

const isProject = computed(() => {
	return props.activity && ActivityType.Project === props.activity.type;
});

const onFieldChange = (key: string, value: any) => {
	(props.activity as any)[key] = value;
};
</script>
<template>
  <v-card class="activity-details pa-4">
    <v-container>
      <v-row
        v-if="!!activity?.removed"
        no-gutters
      >
        <v-col cols="12">
          <v-alert
            class="mb-8"
            color="primary"
            :text="__('This item is removed and can\'t be edited.')"
          />
        </v-col>
      </v-row>
      <v-row
        v-else-if="!!activity?.readonly"
        no-gutters
      >
        <v-col cols="12">
          <v-alert
            class="mb-8"
            color="primary"
            :text="__('This item is imported and can\'t be edited.')"
          />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col
          :md="props.small ? '12' : '8'"
          cols="12"
        >
          <ActivityNew
            v-if="isNew"
            :event="props.event"
            :type="props.type"
            :open-in-sidebar="true"
          />
          <ActivityContent
            v-else-if="props.activity"
            :activity="props.activity"
          />
          <TaskDetails
            v-if="isTask && props.activity"
            :activity="props.activity"
            :small="props.small"
          />
          <ProjectDetails
            v-if="isProject && props.activity"
            :activity="props.activity"
            :small="props.small"
          />
        </v-col>
        <v-col
          :md="props.small ? '12' : '3'"
          :offset-md="props.small ? '0' : '1'"
          cols="12"
        >
          <TaskSidebar
            v-if="isTask"
            :activity="props.activity"
            :small="props.small"
            :event="props.event"
            @fieldChange="onFieldChange"
          />
          <EventSidebar
            v-else-if="isEvent"
            :activity="props.activity"
            :small="props.small"
            :event="props.event"
            @fieldChange="onFieldChange"
          />
          <ProjectSidebar
            v-else-if="isProject"
            :activity="props.activity"
            :small="props.small"
            :event="props.event"
            @fieldChange="onFieldChange"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<style lang="scss">
@import '@/styles/variables.scss';

.activity-details {
    position: relative;
    overflow-y: auto;
    height: calc(100vh - $header-height);

    .v-container {
        max-width: 100%;
    }

    .v-text-field.activity-title input {
        font-size: 1.5rem;
        padding-inline-start: 16px;
    }
}

.activity-title {}

.event-item {
    display: flex;

    .v-divider {
        position: relative;
        top: calc(50% - 1px);
    }
}

.event-item__label {
    min-width: 200px;
    text-align: center;
}
</style>