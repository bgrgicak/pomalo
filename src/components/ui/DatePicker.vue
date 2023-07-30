<script setup lang="ts">
import { getSystemDateFormat, getUtcTimestamp, toInputDateString, getLocalDate } from '@/helper/date';
import { computed } from 'vue';

const props = defineProps(['value', 'label', 'time']);

const emit = defineEmits(['change']);

const systemDateFormat = getSystemDateFormat();


const showTime = computed(() => true === props.time);

const dateValue = computed(() => {
    if (!props.value) {
        return undefined;
    }
    return toInputDateString(getLocalDate(props.value));
});

const timeValue = computed(() => {
    if (!props.value) {
        return undefined;
    }
    return getLocalDate(props.value).toTimeString().substr(0, 5);
});

const onChangeDate = (newValue: string) => {
    if (!newValue) {
        emit('change', undefined);
        return;
    }
    const newDate = new Date(newValue);
    if (timeValue.value) {
        const [hours, minutes] = timeValue.value.split(':');
        newDate.setHours(parseInt(hours));
        newDate.setMinutes(parseInt(minutes));
    }
    emit('change', getUtcTimestamp(newDate));
};
const onChangeTime = (newValue: string) => {
    const timeSplit = newValue.split(':');
    const hours = timeSplit[0] ? parseInt(timeSplit[0]) : 0;
    const minutes = timeSplit[1] ? parseInt(timeSplit[1]) : 0;
    const newDate = new Date(getLocalDate(props.value));
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    emit('change', getUtcTimestamp(newDate));

};
</script>
<template>
    <div :class="{ 'date-picker': true, 'date-picker--has-time': showTime }">
        <v-text-field :label="label"
                      :value="dateValue"
                      class="date-picker__date"
                      @update:modelValue="onChangeDate"
                      type="date"
                      :pattern="systemDateFormat" />
        <v-divider v-if="showTime"
                   vertical
                   inset />
        <v-text-field v-if="showTime"
                      :value="timeValue"
                      class="date-picker__time"
                      @update:modelValue="onChangeTime"
                      type="time"
                      pattern="[0-9]{2}:[0-9]{2}" />
    </div>
</template>
<style lang="scss">
.date-picker {
    &.date-picker--has-time {
        display: flex;
    }

    .v-divider {
        margin-top: 0;
        margin-bottom: 22px;
    }
}

.date-picker__date {
    min-width: 160px;
}

.date-picker__time {
    min-width: 124px;
    max-width: 124px;

    .v-field__input {
        padding: 25px 16px 5px 16px;
    }
}
</style>

