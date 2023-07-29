<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { ImportanceLabels } from '@/types/activity';
import { computed } from 'vue';


const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (value: string | undefined) => {
    activityStore.updateField(
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
</script>
<template>
    <v-select :label="__('Importance')"
              :items="importanceItems"
              :model-value="importance"
              variant="outlined"
              item-title="text"
              item-value="value"
              @update:modelValue="onChange" />
</template>