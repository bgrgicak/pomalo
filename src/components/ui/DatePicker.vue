<script setup lang="ts">
import { getSystemDateFormat, toInputDateString, getLocalDate } from '@/helper/date';
import { computed } from 'vue';

const props = defineProps(['value', 'label', 'time', 'hint', 'variant', 'readonly']);

const emit = defineEmits(['change']);

const systemDateFormat = getSystemDateFormat();


const showTime = computed(() => true === props.time);

const dateValue = computed(() => {
    if (!props.value) {
        return undefined;
    }
    return toInputDateString(props.value);
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
    emit('change', newDate);
};
const onChangeTime = (newValue: string) => {
    const timeSplit = newValue.split(':');
    const hours = timeSplit[0] ? parseInt(timeSplit[0]) : 0;
    const minutes = timeSplit[1] ? parseInt(timeSplit[1]) : 0;
    const newDate = getLocalDate(props.value);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    emit('change', newDate);

};
</script>
<template>
    <div :class="{ 'date-picker': true, 'date-picker--has-time': showTime }">
        <v-text-field :label="label"
                      :value="dateValue"
                      class="date-picker__date"
                      @update:modelValue="onChangeDate"
                      type="date"
                      :readonly="props.readonly"
                      :pattern="systemDateFormat"
                      :hint="props.hint"
                      :variant="props.variant" />
        <v-text-field v-if="showTime"
                      :value="timeValue"
                      class="date-picker__time"
                      @update:modelValue="onChangeTime"
                      type="time"
                      :readonly="props.readonly"
                      pattern="[0-9]{2}:[0-9]{2}"
                      :variant="props.variant" />
    </div>
</template>
<style lang="scss">
.date-picker {
    &.date-picker--has-time {
        display: flex;

        .date-picker__time {
            position: relative;
            left: -1px;
        }
    }
}

.date-picker__date {
    min-width: 160px;
}

.date-picker__time {
    min-width: 124px;
    max-width: 124px;
    border-left: unset;

    .v-field__input {
        padding-left: 6px;
    }
}
</style>

