<script setup lang="ts">
import type Activity from '@/types/activity';
import { remove } from '@/data/activities';
import __ from '@/helper/translations';
import router from '@/router/router';
import { useLayoutStore } from '@/stores/layout';

const props = defineProps(['activity']);

const layoutStore = useLayoutStore();

const closeActivity = (activity: Activity) => {
    if (!confirm(__('Are you sure you want to close this ') + activity.type + '?')) return;
    remove(activity._id).then(() => {
        layoutStore.hideRightSidebar();
        router.push('/' + activity.type + 's');
    });
};
</script>
<template>
    <v-btn color="error"
           class="activity-close"
           @click="closeActivity(props.activity)"
           variant="text">
        {{ __('Close ') + props.activity.type }}
    </v-btn>
</template>