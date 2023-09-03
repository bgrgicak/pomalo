<script setup lang="ts">
import { emptyActivity, getActivityLink } from '@/data/activities';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { useLayoutStore } from '@/stores/layout';
import { useNoticeStore } from '@/stores/notices';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import { NoticeType } from '@/types/notice';
import type { PropType } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import TimerToggle from '../timer/TimerToggle.vue';

const props = defineProps({
	types: {
		type: Array as PropType<ActivityType[]>,
		default: () => [
			ActivityType.Task,
			ActivityType.Event,
			ActivityType.Project,
		],
	},
	addToStore: {
		type: Boolean,
		default: true,
	},
	focused: {
		type: Boolean,
		default: false,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined
	},
});

const emit = defineEmits(['addActivity']);

const focused = ref(props.focused);
const newActivityTitle = ref('');

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();
const searchStore = useSearchStore();

watch(
	() => newActivityTitle.value,
	(searchText: string) => {
		console.log(searchText);
		searchStore.search(searchText, props.types);
	}
);

const placeholder = computed(() => {
	return __('Title');
});

const isInputFocused = computed(() => {
	return focused.value || props.focused;
});

const showOptions = computed(() => {
	return newActivityTitle.value.length > 0;
});

const addActivity = (type?: ActivityType) => {
	if (!type) {
		type = props.types[0];
	}
	if (newActivityTitle.value) {
		const newActivity = emptyActivity(type);
		newActivity.title = newActivityTitle.value;
		if (props.event) {
			newActivity.events = [props.event];
		}

		const afterAdd = (activity: Activity) => {
			layoutStore.showRightSidebar(activity._id);
			emit('addActivity', newActivity);
			newActivityTitle.value = '';
			focused.value = false;
		};
		
		if (props.addToStore) {
			activityStore.add(newActivity)
				.then((response) => {
					if (!response) {
						useNoticeStore().addNotice({
							type: NoticeType.Error,
							title: __('Unable to add ') + type,
						});
						return;
					}
					afterAdd(newActivity);
				});
		} else {
			afterAdd(newActivity);
		}
	}
};

const toggleInput = () => {
	focused.value = !focused.value;
};

const onKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter') {
		addActivity();
	} else if (event.key === 'Escape') {
		toggleInput();
	}
};
</script>
<template>
  <div 
    class="activity-add"
  >
    <v-btn
      v-if="!isInputFocused"
      icon
      variant="text"
      @click="toggleInput"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <div
      v-if="isInputFocused"
      v-click-outside="toggleInput"
      class="activity-add__form"
    >
      <v-text-field
        v-model="newActivityTitle"
        density="compact"
        :placeholder="placeholder"
        class="ma-0"
        :append-inner-icon="'mdi-plus'"
        autofocus
        variant="outlined"
        @keydown="onKeydown"
      >
        <template #append-inner>
          <v-list
            v-if="showOptions"
            class="autocomplete__options"
          >
            <v-list-item
              v-for="activity in searchStore.activities"
              :key="(activity as Activity)._id"
              class="autocomplete__option"
            >
              <v-btn
                class="search__result-title"
                variant="plain"
                :href="getActivityLink(activity)"
              >
                {{ activity.title }}
              </v-btn>
              <template
                #append
              >
                <TimerToggle
                  :activity="
                    activity"
                />
              </template>
            </v-list-item>
            <v-list-item
              v-for="type in props.types"
              :key="(type as string)"
              class="autocomplete__option"
            >
              <v-btn
                :block="true"
                variant="text"
                @click="() => addActivity(type)"
              >
                {{ __('Add ') + type }}
              </v-btn>
            </v-list-item>
          </v-list>
        </template>
      </v-text-field>
    </div>
  </div>
</template>
<style lang="scss">
.activity-add {
    .v-btn {
        width: 44px;
        height: 44px;
        padding-right: 4px;
    }
    .v-input__details {
        display: none;
    }
}
.activity-add__form {
  min-width: 200px;
  z-index: 10;
  position: relative;
}
.autocomplete__options {
  display: block;
  width: 100%;
  position: absolute;
  top: 42px;
  z-index: 2;
  background-color: rgb(var(--v-theme-background));
  left: 0;
  overflow: auto;
  border: 1px solid rgb(var(--v-border-color));
  padding-top: 2px;
}
.autocomplete__option {
    width: 100%;
    .v-btn {
    width: 100%;
    text-align: left;
    justify-content: start;
    }
}
</style>