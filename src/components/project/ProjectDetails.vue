<script setup lang="ts">
import { ActivityType } from '@/types/activity';
import ActivityList from '../activity/ActivityList.vue';
import type { PropType } from 'vue';
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import { ActivityFilterStatus } from '../../types/activity-filter';

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
  <v-row
    class="pa-4 pb-0"
  >
    <v-col cols="12">
      <h2 class="mb-0">
        {{ __('Project tasks') }}
      </h2>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <ActivityList
        :type="ActivityType.Task"
        :compact="true"
        :parent="props.activity._id"
        :items="[]"
        :filters="{status: ActivityFilterStatus.Any}"
      />
    </v-col>
  </v-row>
</template>