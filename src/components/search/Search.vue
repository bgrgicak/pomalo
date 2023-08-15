<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import { computed, nextTick, ref, watch } from 'vue';
import { openActivityPage, emptyActivity } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import TimerToggle from '../timer/TimerToggle.vue';
import { addEventToActivity } from '@/data/events';

const props = defineProps(['searchText', 'openInSidebar', 'newTypes', 'visible', 'event', 'autofocus']);
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
    searchVisible.value = false;
    searchText.value = '';
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
        layoutStore.showRightSidebar(activity._id, props.event);
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
</script>
<template>
    <v-responsive class="search">
        <v-autocomplete v-if="searchVisible"
                        ref="searchRef"
                        v-bind:placeholder="__('Search')"
                        :items="searchStore.activities"
                        v-model:search="searchText"
                        @update:search="searchStore.search"
                        variant="solo-filled"
                        density="compact"
                        class="search__autocomplete"
                        append-inner-icon="mdi-magnify"
                        menu-icon=""
                        :focused="searchVisible"
                        :autofocus="props.autofocus">
            <template v-slot:item="{ props, item }">
                <v-list-item>
                    <v-btn class="search__result-title"
                           variant="plain"
                           @click="() => openActivity(item.raw)">
                        {{ item.raw.title }}
                    </v-btn>
                    <template #append>
                        <TimerToggle :activity="item.raw"
                                     @change="() => timerToggle(item.raw)" />
                    </template>
                </v-list-item>
            </template>
            <template #append-item
                      v-if="searchStore.activities">
                <v-list-item v-for="(newType, newTypeIndex) in newTypes"
                             :key="newTypeIndex">
                    <v-btn variant="plain"
                           color="primary"
                           class="search-action--add text-left"
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

.v-responsive.search {
    align-items: end;
    flex-direction: column;
    flex: 0 0 auto;
}

.search__autocomplete {
    width: $form-width;
    position: relative;
    top: 2px;
}

.search__result-title {
    cursor: pointer;
}
</style>