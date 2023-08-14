<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import { computed, nextTick, ref, watch } from 'vue';
import { openActivityPage, emptyActivity } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import ActivityTitle from '@/components/activity/ActivityTitle.vue';
import TimerToggle from '../timer/TimerToggle.vue';
import { addEventToActivity } from '@/data/events';

const props = defineProps(['searchText', 'openInSidebar', 'newTypes', 'visible', 'event']);
const emit = defineEmits(['hideSearch', 'click']);

const searchVisible = ref(!!props.visible);
const searchRef = ref(null);
const searchText = ref('');

const layoutStore = useLayoutStore();

const activityStore = useActivityStore();
const searchStore = useSearchStore();

const newTypes = computed(
    () => {
        return props.newTypes ?? [ActivityType.Task, ActivityType.Event];
    }
);

const hide = () => {
    emit('hideSearch');
};

const openActivity = (activity: Activity) => {
    emit('click', activity);
    if (props.event) {
        activityStore.update(
            addEventToActivity(
                activity,
                props.event
            )
        );
    }
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
    newActivity.title = searchText.value;

    activityStore.add(newActivity).then(() => {
        openActivity(newActivity);
    });
};
const showSearch = async () => {
    searchVisible.value = true;
    await nextTick();
    if (null !== searchRef.value) {
        (searchRef.value as HTMLInputElement).focus();
    }
};
const hideSearch = () => {
    searchVisible.value = false;
    searchText.value = '';
};
</script>
<template>
    <v-responsive class="header-search">
        <v-autocomplete v-if="searchVisible"
                        ref="searchRef"
                        v-click-outside="hideSearch"
                        v-bind:placeholder="__('Search')"
                        :items="searchStore.activities"
                        v-model:search="searchText"
                        @update:search="searchStore.search"
                        variant="solo-filled"
                        density="compact"
                        class="header-search__autocomplete"
                        append-inner-icon="mdi-magnify"
                        menu-icon=""
                        :focused="searchVisible">
            <template v-slot:item="{ props, item }">
                <v-list-item class="d-flex w-100">
                    <ActivityTitle :activity="item.raw"
                                   class="flex-grow-1"
                                   :disabled="props.openInSidebar"
                                   @click="() => openActivity(item.raw)" />
                    <TimerToggle :activity="item.raw"
                                 @change="() => timerToggle(item.raw)" />
                </v-list-item>
            </template>
            <template #append-item>
                <v-list-item v-for="(newType, newTypeIndex) in newTypes"
                             :key="newTypeIndex">
                    <v-btn variant="text"
                           color="primary"
                           class="search-action--add"
                           @click="() => add(newType)">
                        {{ __('Create') + ' ' + newType }}
                    </v-btn>
                </v-list-item>
            </template>
            <template #no-data></template>
        </v-autocomplete>
        <v-btn v-else
               icon="mdi-magnify"
               @click="showSearch" />
    </v-responsive>
</template>
<style lang="scss">
@import '@/styles/variables.scss';
$form-width: 300px;

.header-search {
    align-items: end;
    flex-direction: column;
}

.header-search__autocomplete {
    width: $form-width;
    position: relative;
    top: 2px;
}
</style>