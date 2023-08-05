<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import type { ActivityEvent } from '@/types/activity';
import { computed } from 'vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { RepeatInterval, RepeatLabels } from '@/types/activity';


const props = defineProps(['activity']);
const emit = defineEmits(['fieldChange']);

const event = computed(() => {
    if (0 === props.activity.events.length) {
        return {} as ActivityEvent;
    }
    return props.activity.events[0];
});

const activityStore = useActivityStore();

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
    const events = [...props.activity.events];
    if (!events[0]) {
        events[0] = {} as ActivityEvent;
    }
    events[0][field] = value;
    activityStore.updateField(
        props.activity._id,
        'events',
        events,
    ).then(() => {
        emit('fieldChange', events);
    });
};
</script>
<template>
    <v-row>
        <v-col cols="12"
               class="pb-0">
            <v-switch :model-value="event.allDay"
                      color="primary"
                      @change="(event: any) => onEventFieldChange('allDay', event.target.checked)"
                      class="event-schedule__all-day"
                      label="All day" />
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="6"
               md="12">
            <DatePicker :label="__('Starts')"
                        :value="event.start"
                        @change="(value: string) => onEventFieldChange('start', value)"
                        :time="!event.allDay" />
        </v-col>
        <v-col cols="6"
               md="12">
            <DatePicker :label="__('Ends')"
                        :value="event.end"
                        @change="(value: string) => onEventFieldChange('end', value)"
                        :time="!event.allDay" />
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12"
               class="pb-0">
            <v-select :label="__('Repeat')"
                      :items="repeatOptions"
                      :model-value="event.repeat"
                      item-title="text"
                      item-value="value"
                      @update:modelValue="(value: string) => onEventFieldChange('repeat', value)" />
        </v-col>
    </v-row>
    <v-row v-if="isRepeatActivity">

        <v-col cols="3">
            <v-text-field :label="__('Interval')"
                          :model-value="event.repeatInterval ?? 1"
                          type="number"
                          min="1"
                          @update:modelValue="(value: string) => onEventFieldChange('repeatInterval', parseInt(value))" />
        </v-col>
        <v-col cols="9">
            <DatePicker :label="__('Repeat ends')"
                        :value="event.repeatEnd"
                        @change="(value: string) => onEventFieldChange('repeatEnd', value)" />
        </v-col>
    </v-row>
    <v-row v-if="RepeatInterval.Weekly === event.repeat">
        <v-col cols="12"
               class="pb-8">
            <v-label class="event-schedule__weekly-label">{{ __('Repeat on days') }}</v-label>
            <v-field class="event-schedule__weekly-repeat-days"
                     variant="plain">
                <v-btn-toggle @update:modelValue="(value: string) => onEventFieldChange('repeatDays', value)"
                              :model-value="event.repeatDays"
                              variant="text"
                              multiple
                              group>
                    <v-btn v-for="day in repeatDaysOfWeekOptions"
                           :key="day.value"
                           :value="day.value">
                        {{ day.text[0] }}
                    </v-btn>
                </v-btn-toggle>
            </v-field>
        </v-col>
    </v-row>
</template>
<style scoped lang="scss">
.event-schedule__all-day {
    height: 56px;
}

.date-picker {
    height: 56px;
}

.event-schedule__weekly-repeat-days {
    width: 100%;

    .v-btn {
        min-width: calc(100% / 7);
        width: calc(100% / 7);
    }
}

.event-schedule__weekly-label {
    font-size: var(--v-field-label-scale);
    --v-field-label-scale: 0.75rem;
    margin-bottom: 5px;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    opacity: var(--v-medium-emphasis-opacity);
    font-weight: 400;
}
</style>