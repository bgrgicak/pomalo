<script setup lang="ts">
import { getSystemDateFormat, getUtcTimestamp, toInputDateString, getLocalDate } from '@/helper/date';
import { computed } from 'vue';

const props = defineProps(['value', 'label']);

const emit = defineEmits(['change']);

const systemDateFormat = getSystemDateFormat();

const value = computed(() => {
    if (!props.value) {
        return undefined;
    }
    return toInputDateString(getLocalDate(props.value));
});

const onChange = (newValue: string) => {
    const date = newValue ? getUtcTimestamp(newValue) : undefined;
    emit('change', date);
};
</script>
<template>
    <v-text-field :label="label"
                  :value="value"
                  @update:modelValue="onChange"
                  type="date"
                  :pattern="systemDateFormat" />
</template>
