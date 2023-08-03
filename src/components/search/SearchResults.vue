<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { watch } from 'vue';
import ActivityTitle from '@/components/activity/ActivityTitle.vue';
import TimerToggle from '../timer/TimerToggle.vue';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import { useLayoutStore } from '@/stores/layout';
import { useSearchStore } from '@/stores/search';

const props = defineProps(['searchText', 'openInSidebar']);
const emit = defineEmits(['hideSearch', 'click']);

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();
const searchStore = useSearchStore();

watch(() => props.searchText, async (searchText: string) => {
    searchStore.search(searchText);
});

const hide = () => {
    emit('hideSearch');
};

const openActivity = (activity: Activity) => {
    emit('click', activity);
    if (props.openInSidebar) {
        layoutStore.showRightSidebar(activity._id);
    } else {
        openActivityPage(activity);
    }
    hide();
};

const timerToggle = (activity: Activity) => {
    emit('click', activity);
    hide();
};

const add = (type: ActivityType) => {
    const newActivity = emptyActivity(type);
    newActivity.title = props.searchText;

    activityStore.add(newActivity).then(() => {
        openActivity(newActivity);
    });
};

</script>
<template>
    <v-card class="search-results"
            v-if="searchText">
        <v-list>
            <v-list-item v-if="searchStore.activities.length"
                         v-for="activity in searchStore.activities"
                         :key="activity._id"
                         class="search-result"
                         @click="() => openActivity(activity)">
                <ActivityTitle :activity="activity"
                               :disabled="props.openInSidebar" />
                <TimerToggle :activity="activity"
                             @change="() => timerToggle(activity)" />
            </v-list-item>
            <v-list-item>
                <v-btn variant="text"
                       color="primary"
                       class="search-action--add"
                       @click="() => add(ActivityType.Event)">
                    {{ __('Create event ') }}
                </v-btn>
            </v-list-item>
            <v-list-item>
                <v-btn variant="text"
                       class="search-action--add"
                       color="primary"
                       @click="() => add(ActivityType.Task)">
                    {{ __('Create task ') }}
                </v-btn>
            </v-list-item>
        </v-list>
    </v-card>
</template>
<style lang="scss">
.search-result {
    .v-list-item__content {
        display: flex;
        align-items: center;

        .activity-title {
            text-align: left;
            display: inline-block;
            flex-grow: 1;
        }
    }
}

.search-action--add {
    width: 100%;
    padding: 0;
    display: flex;

    .v-btn__content {
        text-align: left;
        display: inline-block;
        flex-grow: 1;
    }
}
</style>
