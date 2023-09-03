<script setup lang="ts">
import { emptyActivity, getActivityLink } from '@/data/activities';
import __ from '@/helper/translations';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import type { PropType } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import TimerToggle from '../timer/TimerToggle.vue';
import type { SearchOptions } from '@/types/search';

const props = defineProps({
	types: {
		type: Array as PropType<ActivityType[]>,
		default: () => [
			ActivityType.Task,
			ActivityType.Event,
			ActivityType.Project,
		],
	},
	focused: {
		type: Boolean,
		default: false,
	},
	search: {
		type: Boolean,
		default: true,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined
	},
	showTimer: {
		type: Boolean,
		default: false,
	},
	searchOptions: {
		type: Object as PropType<SearchOptions>,
		default: undefined,
	},
});

const emit = defineEmits(['optionClick', 'newClick']);

const focused = ref(props.focused);
const newActivityTitle = ref('');

const searchStore = useSearchStore();

if (props.search) {
	watch(
		() => newActivityTitle.value,
		(searchText: string) => {
			searchStore.search(
				searchText,
				{
					...props.searchOptions,
					types: props.types
				}
			);
		}
	);
}

const placeholder = computed(() => {
	return __('Title');
});

const isInputFocused = computed(() => {
	return focused.value || props.focused;
});

const showOptions = computed(() => {
	return newActivityTitle.value.length > 0;
});

const toggleInput = () => {
	focused.value = !focused.value;
};

const onKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter') {
		// addActivity();
	} else if (event.key === 'Escape') {
		toggleInput();
	}
};

const onOptionClick = (activity: Activity) => {
	const newActivity= JSON.parse(JSON.stringify(activity));
	if (props.event) {
		newActivity.events.push(props.event);
	}
	emit('optionClick', newActivity);
	toggleInput();

	// Prevent default, TODO allow if cmd or ctrl is pressed
	return false;
};

const onNewClick = (type: ActivityType) => {
	const newActivity = emptyActivity(type);
	newActivity.title = newActivityTitle.value;
	if (props.event) {
		newActivity.events = [props.event];
	}
	emit('newClick', newActivity);
	toggleInput();
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
              :key="activity._id"
              class="autocomplete__option"
            >
              <v-btn
                class="search__result-title"
                variant="plain"
                :href="getActivityLink(activity)"
                @click="() => onOptionClick(activity)"
              >
                {{ activity.title }}
              </v-btn>
              <template
                v-if="props.showTimer"
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
                @click="() => onNewClick(type)"
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
  min-width: 180px;
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