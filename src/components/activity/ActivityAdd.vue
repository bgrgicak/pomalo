<script setup lang="ts">
import { emptyActivity } from '@/data/activities';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { useLayoutStore } from '@/stores/layout';
import { useNoticeStore } from '@/stores/notices';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import { NoticeType } from '@/types/notice';
import type { PropType } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';

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
});

const emit = defineEmits(['addActivity']);

const showInput = ref(false);
const newActivityTitle = ref('');

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const placeholder = computed(() => {
	return __('Title');
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

		const afterAdd = (activity: Activity) => {
			layoutStore.showRightSidebar(activity._id);
			emit('addActivity', newActivity);
			newActivityTitle.value = '';
			showInput.value = false;
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
	showInput.value = !showInput.value;
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
      v-if="!showInput"
      icon
      variant="text"
      @click="toggleInput"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <div
      v-if="showInput"
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
          <ul
            v-if="showOptions"
            class="autocomplete__options"
          >
            <li
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
            </li>
          </ul>
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