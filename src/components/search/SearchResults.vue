<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { ref, watch, type Ref } from 'vue';
import ActivityTitle from '@/components/activity/ActivityTitle.vue';
import TimerToggle from '../timer/TimerToggle.vue';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import { useLayoutStore } from '@/stores/layout';

const props = defineProps(['searchText', 'openInSidebar']);
const searchResults: Ref<Activity[]> = ref([]);
const emit = defineEmits(['hideSearch', 'click']);

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

watch(() => props.searchText, async (searchText: string) => {
    if (searchText.length < 3) {
        searchResults.value = [];
        return;
    }
    activityStore.find({
        selector: {
            title: {
                $regex: new RegExp(searchText, 'gi'),
            },
        },
    }).then((response) => {
        searchResults.value = response ?? [];
    });
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
            <v-list-item v-if="searchResults.length"
                         v-for="activity in searchResults"
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
