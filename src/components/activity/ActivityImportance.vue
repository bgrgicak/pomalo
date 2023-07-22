<script setup lang="ts">
import { updateField } from '@/data/activities';
import __ from '@/helper/translations';
import DatePicker from '@/components/ui/DatePicker.vue';
import { ImportanceLabels, Importance } from '@/types/activity';
import { computed } from 'vue';


const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const onChange = (value: string | undefined) => {
    console.log(value);
    updateField(
        props.activity._id,
        'importance',
        value,
    ).then(() => {
        emit('change', value);
    });
};
const importanceItems = Object.keys(ImportanceLabels).map((key) => {
    return {
        text: (ImportanceLabels as any)[key].label,
        value: key,
    };
});

const importance = computed(() => {
    if (!props.activity.importance) {
        return undefined;
    }
    return (ImportanceLabels as any)[props.activity.importance].label;
});
console.log(props.activity.importance);
</script>
<template>
    <v-select :label="__('How important is it?')"
              :items="importanceItems"
              :model-value="importance"
              item-title="text"
              item-value="value"
              @update:modelValue="onChange" />
</template>