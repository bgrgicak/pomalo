<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import { computed, nextTick, ref, watch } from 'vue';
import { openActivityPage, emptyActivity } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import __ from '@/helper/translations';
import TimerToggle from '../timer/TimerToggle.vue';
import { addEventToActivity } from '@/data/events';
import type { PropType } from 'vue';


const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  openInSidebar: {
    type: Boolean,
    default: false,
  },
  types: {
    type: Array as PropType<ActivityType[]>,
    default: () => [ActivityType.Task, ActivityType.Event],
  },
  newTypes: {
    type: Array as PropType<ActivityType[]>,
    default: () => [ActivityType.Task, ActivityType.Event],
  },
  visible: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object as PropType<ActivityEvent>,
    default: undefined,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as PropType<any>,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  preventDefault: {
    type: Boolean,
    default: false,
  },
  hideTimer: {
    type: Boolean,
    default: false,
  },
  hideIcon: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
});
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

const noInput = computed(
    () => {
        return searchText.value.length === 0;
    }
);

const hide = () => {
    searchText.value = '';
    searchStore.clear();
    if (props.visible) {
        return;
    }
    searchVisible.value = false;
    emit('hideSearch');
};

const openActivity = (activity: Activity) => {
    if (props.preventDefault) {
        emit('click', activity);
        toggleFocus();
    } else {
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
    }
    hide();
};

const timerToggle = (activity: Activity) => {
    if (props.openInSidebar) {
        layoutStore.showRightSidebar(activity._id, props.event);
    }
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
    toggleFocus();
};

const toggleFocus = (state?: boolean) => {
    if (null !== searchRef.value) {
        const element: any = searchRef.value;
        if (element.focused || state === false) {
            element.blur();
        } else if (!element.focused || state === true) {
            element.focus();
        }
    }
};

const onSearch = (searchText: string) => {
    searchStore.search(searchText, props.types);
};

const onClear = () => {
    emit('click', undefined);
    hide();
};
</script>
<template>
  <v-autocomplete
    v-if="searchVisible"
    ref="searchRef"
    v-model:search="searchText"
    v-click-outside="hide"
    :model-value="props.value"
    :label="props.label"
    :placeholder="props.placeholder ?? __('Search')"
    :items="searchStore.activities"
    :variant="props.variant"
    density="compact"
    class="search"
    :append-inner-icon="props.hideIcon ? '' : 'mdi-magnify'"
    menu-icon=""
    :hide-no-data="noInput"
    :focused="searchVisible"
    :autofocus="props.autofocus"
    :clearable="props.clearable"
    @update:search="onSearch"
    @click:clear="onClear"
  >
    <template #item="{ item }">
      <v-list-item>
        <v-btn
          class="search__result-title"
          variant="plain"
          @click="() => openActivity(item.raw)"
        >
          {{ item.raw.title }}
        </v-btn>
        <template
          v-if="!hideTimer"
          #append
        >
          <TimerToggle
            :activity="item.raw"
            @change="() => timerToggle(item.raw)"
          />
        </template>
      </v-list-item>
    </template>
    <template
      v-if="!noInput"
      #append-item
    >
      <v-list-item
        v-for="(newType, newTypeIndex) in newTypes"
        :key="newTypeIndex"
      >
        <v-btn
          variant="plain"
          color="primary"
          class="search-action--add text-left"
          @click="() => add(newType)"
        >
          {{ __('Create') + ' ' + newType }}
        </v-btn>
      </v-list-item>
    </template>
    <template #no-data />
  </v-autocomplete>
  <v-btn
    v-else
    icon="mdi-magnify"
    @click="showSearch"
  />
</template>
<style lang="scss">
@import '@/styles/variables.scss';
$form-width: 300px;

.search {
    max-width: $form-width;
    width: 100%;
    position: relative;
    top: 11px;
}

.search__result-title {
    cursor: pointer;
}
</style>