<script setup lang="ts">
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import ActivitySelect from '../activity/ActivitySelect.vue';
import type { PropType } from 'vue';
import { useActivityListStore } from '@/stores/activity-list';
import type { Ref } from 'vue';
import { ref } from 'vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

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
	if (!props.activity.parent) {
		return undefined;
	}
	activityStore.get(props.activity.parent);
	if (!activityStore.activities[props.activity.parent]) {
		return undefined;
	}
	return activityStore.activities[props.activity.parent].title;
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
</script>
<template>
  <v-autocomplete
    :model-value="parentTitle"
    :items="options"
    item-value="_id"
    item-text="title"
    @update:model-value="onClick"
  />
</template>
<style lang="scss">
.activity-parent {
    max-width: 100%;
}
</style>