<script setup lang="ts">
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import type { PropType } from 'vue';
import { useActivityListStore } from '@/stores/activity-list';
import type { Ref } from 'vue';
import { ref } from 'vue';

const props = defineProps({
	modelValue: {
		type: String as PropType<string | undefined>,
		default: undefined,
	}
});
const emit = defineEmits(['update:modelValue']);

const listId: Ref<string | undefined> = ref(undefined);

const activityListStore = useActivityListStore();
const activityStore = useActivityStore();

activityListStore.find(ActivityType.Project).then((newListId: string) => {
	if (!newListId) {
		return;
	}
	listId.value = newListId;
});

const parentTitle: ComputedRef<string | undefined> = computed(() => {
	if (!props.modelValue) {
		return undefined;
	}
	activityStore.get(props.modelValue);
	if (!activityStore.activities[props.modelValue]) {
		return undefined;
	}
	return activityStore.activities[props.modelValue].title;
});

const options = computed( () => {
	if (!listId.value) {
		return [];
	}
	return activityListStore.list[listId.value];
});

const onClick = (activityId: string) => {
	emit('update:modelValue', activityId);
};
</script>
<template>
  <v-autocomplete
    :model-value="parentTitle"
    :items="options"
    item-value="_id"
    item-text="title"
    :label="__('Project')"
    @update:model-value="onClick"
  />
</template>