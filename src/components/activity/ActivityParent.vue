<script setup lang="ts">
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type { ComputedRef, PropType } from 'vue';
import { useActivityListStore } from '@/stores/activity-list';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { openActivityPage } from '@/data/activities';
import { computed } from 'vue';
import { ActivityType } from '@/types/activity';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

const listId: Ref<string | undefined> = ref(undefined);

const activityStore = useActivityStore();
const activityListStore = useActivityListStore();

activityListStore.find(ActivityType.Project).then((newListId: string) => {
	if (!newListId) {
		return;
	}
	listId.value = newListId;
});

const parent = computed(() => {
	if (!props.activity.parent) {
		return undefined;
	}
	activityStore.get(props.activity.parent);
	return activityStore.activities[props.activity.parent];
});

const parentTitle: ComputedRef<string | undefined> = computed(() => {
	if (!parent.value) {
		return undefined;
	}
	return parent.value.title;
});

const options = computed( () => {
	if (!listId.value) {
		return [];
	}
	return activityListStore.list[listId.value];
});

const onClick = (activityId: string) => {
	const newValue = activityId ?? undefined;
	activityStore.updateField(
		props.activity._id,
		'parent',
		newValue,
	).then(() => {
		emit('change', newValue);
	});
};

const openParent = () => {
	if (!parent.value) {
		return;
	}
	openActivityPage(parent.value);
};
</script>
<template>
  <ProjectSelect
    :model-value="parentTitle"
    :items="options"
    item-value="_id"
    item-text="title"
    :append-icon="props.activity.parent ? 'mdi-open-in-new' : undefined"
    @update:modelValue="onClick"
    @click:append="openParent"
    @update:model-value="onClick"
  />
</template>
<style lang="scss">
.activity-parent {
    max-width: 100%;
}
</style>