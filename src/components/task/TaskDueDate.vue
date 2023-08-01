<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import DatePicker from '@/components/ui/DatePicker.vue';
import { getLocalDate } from '@/helper/date';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (value: string | undefined) => {
    const newValue = value ? getLocalDate(value) : undefined;
    activityStore.updateField(
        props.activity._id,
        'dueDate',
        newValue,
    ).then(() => {
        emit('change', newValue);
    });
};
</script>
<template>
    <DatePicker :label="__('Due date')"
                variant="outlined"
                :value="props.activity.dueDate"
                @change="onChange" />
</template>