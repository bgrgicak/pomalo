<script setup lang="ts">
import type Activity from '@/types/activity';
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import router from '@/router/router';
import { useLayoutStore } from '@/stores/layout';
import { ActivityType } from '@/types/activity';
import { computed } from 'vue';

const props = defineProps(['activity']);

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const buttonLabel = computed(() => {
    if (ActivityType.Task === props.activity.type) {
        return __('Close Task');
    } else if (ActivityType.Event === props.activity.type) {
        return __('Delete Event');
    }
    return __('Delete');
});

const closeActivity = (activity: Activity) => {
    if (!confirm(__('Are you sure you want to close this ') + activity.type + '?')) return;
    activityStore.remove(activity._id).then(() => {
        layoutStore.hideRightSidebar();
        if (router.currentRoute.value.path.startsWith('/task/'))
            router.push('/' + activity.type + 's');
    });
};
</script>
<template>
    <v-btn color="error"
           class="activity-close"
           @click="closeActivity(props.activity)"
           variant="text">
        {{ buttonLabel }}
    </v-btn>
</template>