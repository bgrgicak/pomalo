<script setup lang="ts">
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import Search from '../search/Search.vue';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const parentTypes = [ActivityType.Project];

const activityStore = useActivityStore();

const parentTitle: ComputedRef<string | undefined> = computed(() => {
    if (!props.activity.parent) {
        return undefined;
    }
    activityStore.get(props.activity.parent);
    if (!activityStore.activities[props.activity.parent]) {
        return undefined;
    }
    return activityStore.activities[props.activity.parent].title;
});

const onClick = (activity: Activity) => {
    if (activity?._id) {
        activityStore.get(activity._id);
    }
    const newValue = activity?._id;
    activityStore.updateField(
        props.activity._id,
        'parent',
        newValue,
    ).then(() => {
        emit('change', newValue);
    });
};
</script>
<template>
    <Search :types="parentTypes"
            :value="parentTitle"
            :newTypes="parentTypes"
            :label="__('Project')"
            :placeholder="__('Select a project')"
            :visible="true"
            :hideTimer="true"
            :hideIcon="true"
            :preventDefault="true"
            :clearable="true"
            class="activity-parent"
            @click="onClick" />
</template>
<style lang="scss">
.activity-parent {
    max-width: 100%;
}
</style>