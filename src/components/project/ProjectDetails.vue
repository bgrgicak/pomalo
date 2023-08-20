<script setup lang="ts">
import { ActivityType } from '@/types/activity';
import ActivityList from '../activity/ActivityList.vue';
import type { PropType } from 'vue';
import type Activity from '@/types/activity';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	},
	small: {
		type: Boolean,
		default: false,
	},
});
</script>
<template>
  <ActivityList
    :type="ActivityType.Task"
    :add-button="false"
    :parent="props.activity._id"
    :items="[]"
  />    
</template>