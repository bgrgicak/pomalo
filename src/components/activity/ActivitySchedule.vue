<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import type { ActivityEvent } from '@/types/activity';
import { computed } from 'vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { RepeatInterval, RepeatLabels } from '@/types/activity';
import { updateEventFieldInActivity } from '@/data/events';
import type Activity from '@/types/activity';
import type { PropType } from 'vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined,
	},
	repeat: {
		type: Boolean,
		default: true,
	},
	allDay: {
		type: Boolean,
		default: true,
	},
	small: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['fieldChange']);

const event = computed(() => {
	if (0 === props.activity.events.length) {
		return {} as ActivityEvent;
	}

	if (props.event) {
		const newEvent = props.activity.events.find((eventIteration: ActivityEvent) => {
			return eventIteration.id === props.event?.id;
		});
		if (newEvent) {
			return newEvent;
		}
	}
	return props.activity.events[0];
});

const activityStore = useActivityStore();
let typingTimeout: any = undefined;

const repeatOptions = Object.keys(RepeatLabels).map((key) => {
	return {
		text: (RepeatLabels as any)[key].label,
		value: key,
	};
});

const repeatDaysOfWeekOptions = [
	{
		text: __('Monday'),
		value: 1,
	},
	{
		text: __('Tuesday'),
		value: 2,
	},
	{
		text: __('Wednesday'),
		value: 3,
	},
	{
		text: __('Thursday'),
		value: 4,
	},
	{
		text: __('Friday'),
		value: 5,
	},
	{
		text: __('Saturday'),
		value: 6,
	},
	{
		text: __('Sunday'),
		value: 0,
	},
];

const isRepeatActivity = computed(() => {
	return event.value.repeat;
});

const onEventFieldChange = (field: string, value: any) => {
	const updatedActivity = updateEventFieldInActivity(
		props.activity,
		event.value,
		field,
		value,
	);
	activityStore.update(updatedActivity).then(() => {
		emit('fieldChange', updatedActivity.events);
	});
};

const onIntervalChange = (value: any) => {
	if (typingTimeout) {
		clearTimeout(typingTimeout);
	}
	typingTimeout = setTimeout(() => {
		onEventFieldChange('repeatInterval', parseInt(value));
	}, 500);
};
</script>
<template>
  <v-row v-if="false !== props.allDay">
    <v-col
      cols="12"
      class="pb-0"
    >
      <v-switch
        :model-value="event.allDay"
        :readonly="props.activity.readonly"
        color="primary"
        class="activity-schedule__all-day"
        label="All day"
        @change="(event: any) => onEventFieldChange('allDay', event.target.checked)"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col
      cols="12"
      :sm="props.small ? 12 : 6"
      md="12"
    >
      <DatePicker
        :label="__('Starts')"
        :readonly="props.activity.readonly"
        :value="event.start"
        :time="!event.allDay"
        :max="event.end"
        @change="(value: string) => onEventFieldChange('start', value)"
      />
    </v-col>
    <v-col
      cols="12"
      :sm="props.small ? 12 : 6"
      md="12"
    >
      <DatePicker
        :label="__('Ends')"
        :readonly="props.activity.readonly"
        :min="event.start"
        :value="event.end"
        :time="!event.allDay"
        @change="(value: string) => onEventFieldChange('end', value)"
      />
    </v-col>
  </v-row>
  <template v-if="false !== props.repeat">
    <v-row>
      <v-col
        cols="12"
        class="pb-0"
      >
        <v-select
          :label="__('Repeat')"
          :readonly="props.activity.readonly"
          :items="repeatOptions"
          :model-value="event.repeat"
          item-title="text"
          item-value="value"
          @update:modelValue="(value: string) => onEventFieldChange('repeat', value)"
        />
      </v-col>
    </v-row>
    <v-row v-if="isRepeatActivity">
      <v-col cols="3">
        <v-text-field
          :label="__('Interval')"
          :readonly="props.activity.readonly"
          :model-value="event.repeatInterval ?? 1"
          type="number"
          min="1"
          @update:modelValue="onIntervalChange"
        />
      </v-col>
      <v-col cols="9">
        <DatePicker
          :label="__('Repeat ends')"
          :min="event.start"
          :readonly="props.activity.readonly"
          :value="event.repeatEnd"
          @change="(value: string) => onEventFieldChange('repeatEnd', value)"
        />
      </v-col>
    </v-row>
    <v-row v-if="RepeatInterval.Weekly === event.repeat">
      <v-col
        cols="12"
        class="pb-8"
      >
        <v-label class="activity-schedule__weekly-label">
          {{ __('Repeat on days') }}
        </v-label>
        <v-field
          class="activity-schedule__weekly-repeat-days"
          variant="plain"
        >
          <v-btn-toggle
            :model-value="event.repeatDays"
            :readonly="props.activity.readonly"
            variant="text"
            multiple
            group
            @update:modelValue="(value: string) => onEventFieldChange('repeatDays', value)"
          >
            <v-btn
              v-for="day in repeatDaysOfWeekOptions"
              :key="day.value"
              :readonly="props.activity.readonly"
              :value="day.value"
            >
              {{ day.text[0] }}
            </v-btn>
          </v-btn-toggle>
        </v-field>
      </v-col>
    </v-row>
  </template>
</template>
<style scoped lang="scss">
.activity-schedule__all-day {
    height: 56px;
}

.date-picker {
    height: 56px;
}

.activity-schedule__weekly-repeat-days {
    width: 100%;

    .v-btn {
        min-width: calc(100% / 7);
        width: calc(100% / 7);
    }
}

.activity-schedule__weekly-label {
    font-size: var(--v-field-label-scale);
    --v-field-label-scale: 0.75rem;
    margin-bottom: 5px;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    opacity: var(--v-medium-emphasis-opacity);
    font-weight: 400;
}
</style>