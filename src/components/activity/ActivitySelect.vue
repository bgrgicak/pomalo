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
import type { Ref } from 'vue';
import { nextTick } from 'vue';

const props = defineProps({
	value: {
		type: String,
		default: '',
	},
	types: {
		type: Array as PropType<ActivityType[]>,
		default: () => [
			ActivityType.Task,
			ActivityType.Event,
			ActivityType.Project,
		],
	},
	newTypes: {
		type: Array as PropType<ActivityType[]>,
		default: undefined,
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
	small: {
		type: Boolean,
		default: true,
	},
	showTimer: {
		type: Boolean,
		default: false,
	},
	searchOptions: {
		type: Object as PropType<SearchOptions>,
		default: undefined,
	},
	icon: {
		type: String,
		default: 'mdi-plus',
	},
	placeholder: {
		type: String,
		default: undefined,
	},
	variant: {
		type: String as PropType<any>,
		default: undefined,
	},
	label: {
		type: String,
		default: undefined,
	},
	density: {
		type: String as PropType<any>,
		default: 'compact',
	},
	clearable: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['optionClick', 'newClick', 'onEscape']);

const selectedOption: Ref<number|undefined> = ref(undefined);
const selectOptionsRef: Ref<any | undefined> = ref(undefined);

const focused = ref(props.focused);
const newActivityTitle = ref(props.value);

const searchStore = useSearchStore();

watch(
	() => newActivityTitle.value,
	(searchText: string) => {
		if (props.search) {
			searchStore.search(
				searchText,
				{
					...props.searchOptions,
					types: props.types
				}
			);
		}
	}
);

const placeholder = computed(() => {
	if (props.placeholder) {
		return props.placeholder;
	}
	return __('Title');
});


const isInputFocused = computed(() => {
	return focused.value || props.focused;
});

const isInputVisible = computed(() => {
	return false === props.small || isInputFocused.value;
});

const showOptions = computed(() => {
	return newActivityTitle.value.length > 0;
});

const newTypes = computed(() => {
	if (props.newTypes) {
		return props.newTypes;
	}
	return props.types;
});

const optionCount = computed(() => {
	return searchStore.activities.length + newTypes.value.length;
});

const toggleInput = () => {
	focused.value = !focused.value;
	newActivityTitle.value = '';
};

const scrollSelectedOptionIntoView = () => {
	if (!selectOptionsRef.value) {
		return;
	}
	const listElement = selectOptionsRef.value.$el;
	if (!listElement) {
		return;
	}
	const selectedOptionElement = listElement.querySelector('.autocomplete__option--selected');
	if (!selectedOptionElement) {
		return;
	}
	listElement.scrollTop = selectedOptionElement.offsetTop - listElement.offsetTop;
};

const onArrowKey = (direction: number) => {
	// -1 is up, 1 is down
	if (-1 === direction) {
		let newSelectedValue = selectedOption.value === undefined
			? optionCount.value - 1
			: selectedOption.value - 1;
		if (newSelectedValue < 0) { 
			newSelectedValue = optionCount.value - 1;
		}
		selectedOption.value = newSelectedValue;
	} else if (1 === direction) {
		let newSelectedValue = selectedOption.value === undefined
			? 0
			: selectedOption.value + 1;
		if (newSelectedValue >= optionCount.value) {
			newSelectedValue = 0;
		}
		selectedOption.value = newSelectedValue;
	}
	nextTick(() => {
		scrollSelectedOptionIntoView();
	});
};


const onKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Enter') {
		if (selectedOption.value === undefined) {
			if (searchStore.activities.length === 0) {
				onNewClick(newTypes.value[0]);
			} else {
				onOptionClick(searchStore.activities[0]);
			}
		} else if (selectedOption.value < searchStore.activities.length) {
			onOptionClick(searchStore.activities[selectedOption.value]);
		} else {
			onNewClick(newTypes.value[selectedOption.value - searchStore.activities.length]);
		}
	} else if (event.key === 'Escape') {
		toggleInput();
		emit('onEscape');
	}
	// if arrow up or down is pressed
	if (event.key === 'ArrowUp') {
		onArrowKey(-1);
	} else if (event.key === 'ArrowDown') {
		onArrowKey(1);
	} else {
		selectedOption.value = undefined;
	}
};

const onOptionClick = (activity: Activity, event?: Event) => {
	if (event) {
		event.preventDefault();
	}

	const newActivity= JSON.parse(JSON.stringify(activity));
	if (props.event) {
		newActivity.events.push(props.event);
	}
	emit('optionClick', newActivity);
	toggleInput();
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
    class="activity-select"
    :class="{
      'activity-select--focused': isInputFocused
    }"
  >
    <v-btn
      v-if="!isInputFocused"
      icon
      variant="text"
      @click="toggleInput"
    >
      <v-icon>{{ props.icon }}</v-icon>
    </v-btn>
    <div
      v-if="isInputVisible"
      v-click-outside="toggleInput"
      class="activity-select__form"
    >
      <v-text-field
        v-model="newActivityTitle"
        :placeholder="placeholder"
        class="ma-0"
        :append-inner-icon="props.icon"
        autofocus
        :variant="props.variant ?? 'outlined'"
        :label="props.label"
        :density="props.density"
        :clearable="props.clearable"
        @keydown="onKeydown"
      />
      <v-card
        v-if="showOptions"
        class="autocomplete__options"
      >
        <v-list
          v-if="newActivityTitle"
          ref="selectOptionsRef"
        >
          <v-list-item
            v-for="(activity, activityIndex) in searchStore.activities"
            :key="activity._id"
            class="autocomplete__option"
            :class="{
              'autocomplete__option--selected': selectedOption === activityIndex
            }"
          >
            <v-btn
              class="search__result-title"
              variant="plain"
              :href="getActivityLink(activity)"
              @click="(event: Event) => onOptionClick(activity, event)"
            >
              {{ activity.title }}
            </v-btn>
            <template
              v-if="props.showTimer"
              #append
            >
              <TimerToggle
                :activity="activity"
              />
            </template>
          </v-list-item>
          <v-list-item
            v-for="(type, typeIndex) in newTypes"
            :key="(type as string)"
            class="autocomplete__option"
            :class="{
              'autocomplete__option--selected': selectedOption === (typeIndex + searchStore.activities.length)
            }"
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
      </v-card>
    </div>
  </div>
</template>
<style lang="scss">
.activity-select {
    .v-btn {
        width: 44px;
        height: 44px;
        padding-right: 4px;
    }
    .v-input__details {
        display: none;
    }
}
.activity-select__form {
  min-width: 200px;
  z-index: 10;
  position: relative;
  .v-field__input {
    height: 44px;
  }
}
.autocomplete__options.v-card {
  display: block;
  width: 100%;
  position: absolute !important;
  min-width: 180px;
  top: 40px;
  z-index: 2;
  background-color: rgb(var(--v-theme-background));
  left: 0;
  overflow: visible;
  border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
  border-top: none;
  padding: 0px;
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;

  &:before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #ffffff;
    display: block;
    z-index: 1;
  }

  .v-list {
    overflow: auto;
    max-height: 300px;
  }
}
.autocomplete__option.v-list-item {
    width: 100%;
    padding: 0 !important;
    .v-btn {
      width: 100%;
      text-align: left;
      justify-content: start;
      .v-btn__content {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        justify-content: left;
        display: block;
      }
    }
    &.autocomplete__option--selected {
        background-color: rgb(var(--v-theme-primary));
        color: rgb(var(--v-theme-on-primary));
        .timer-toggle {
          .v-icon {
            color: rgb(var(--v-theme-on-primary-darken-1))
          }
        }
    }
    
    .v-list-item__append {
      padding-right: 1rem;
      .v-btn {
        padding: 0;
      }
    }
}
.activity-select--focused {
  overflow: visible;
  .autocomplete__options.v-list {
    border: 2px solid rgba(var(--v-border-color), var(--v-high-emphasis-opacity));
    border-top: none;
  }
}
</style>