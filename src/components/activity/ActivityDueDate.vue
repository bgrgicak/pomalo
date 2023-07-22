<script setup lang="ts">
import { updateField } from '@/data/activities';
import __ from '@/helper/translations';
import DatePicker from '@/components/ui/DatePicker.vue';


const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const onChange = (value: string | undefined) => {
    const newValue = value ? new Date(value) : undefined;
    updateField(
        props.activity._id,
        'dueDate',
        newValue,
    ).then(() => {
        emit('change', newValue);
    });
};
</script>
<template>
    <DatePicker :label="__('When is it due?')"
                :value="props.activity.dueDate"
                @change="onChange" />
</template>