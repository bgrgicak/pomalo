<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import type { ActivityEvent } from '@/types/activity';
import { computed } from 'vue';
import DatePicker from '@/components/ui/DatePicker.vue';
import { FrequencyLabels, RepeatInterval, RepeatLabels } from '@/types/activity';


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

const repeatFrequencyOptions = Object.keys(FrequencyLabels).map((key) => {
    return {
        text: (FrequencyLabels as any)[key].label,
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
        value: 7,
    },
];

const isCustom = computed(() => {
    return RepeatInterval.Custom === event.value.repeat;
});

const onEventFieldChange = (field: string, value: string | undefined) => {
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
                        variant="outlined"
                        :value="event.start"
                        @change="(value: string) => onEventFieldChange('start', value)"
                        :time="!event.allDay" />
        </v-col>
        <v-col cols="6"
               md="12">
            <DatePicker :label="__('Ends')"
                        variant="outlined"
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
                      variant="outlined"
                      item-title="text"
                      item-value="value"
                      @update:modelValue="(value: string) => onEventFieldChange('repeat', value)" />
        </v-col>
    </v-row>
    <v-row v-if="isCustom">
        <v-col cols="12"
               class="pb-8">
            <v-select :label="__('Frequency')"
                      :items="repeatFrequencyOptions"
                      :model-value="event.repeatFrequency"
                      variant="outlined"
                      item-title="text"
                      item-value="value"
                      @update:modelValue="(value: string) => onEventFieldChange('repeatFrequency', value)" />
            <v-text-field :label="__('Interval')"
                          :model-value="event.repeatInterval ?? 1"
                          variant="outlined"
                          type="number"
                          :hint="__('How often the event should repeat.')"
                          @update:modelValue="(value: string) => onEventFieldChange('repeatInterval', value)" />
            <v-btn-toggle v-if="RepeatInterval.Weekly === event.repeatFrequency"
                          @update:modelValue="(value: string) => onEventFieldChange('repeatDaysOfWeek', value)"
                          :model-value="event.repeatDays"
                          variant="outlined"
                          multiple
                          rounded="0"
                          group>
                <v-btn v-for="day in repeatDaysOfWeekOptions"
                       :key="day.value"
                       :value="day.value"
                       size="x-small">
                    {{ day.text[0] }}
                </v-btn>
            </v-btn-toggle>
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
</style>