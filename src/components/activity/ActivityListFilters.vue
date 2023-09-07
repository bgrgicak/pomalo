<script setup lang="ts">
import __ from '@/helper/translations';
import { ref } from 'vue';
import ProjectSelect from '../project/ProjectSelect.vue';
import { useActivityFilterStore } from '@/stores/activity-filters';

const activityFilterStore = useActivityFilterStore();

const groupOptions = [
	{
		'title': 'Completed',
		'value': 'completed',
	},
	{
		'title': 'Project',
		'value': 'project',
	}
];

const sortOptions = [
	{
		'title': 'Priority',
		'value': 'priority',
	},
	{
		'title': 'Name',
		'value': 'name',
	},
	{
		'title': 'Due date',
		'value': 'dueDate',
	},
	{
		'title': 'Created',
		'value': 'created',
	},
];
</script>
<template>
  <v-row class="pa-4 pt-8">
    <v-col
      cols="12"
    >
      <h3 class="mb-0">
        {{ __('Filter') }}
      </h3>
    </v-col>
    <v-col
      cols="12"
      class="py-0"
    >
      <v-switch
        :model-value="activityFilterStore.filters.completed"
        label="Show completed"
        color="primary"
        :hide-details="true"
        @update:model-value="(value) => activityFilterStore.updateFilter('completed', value)"
      />
    </v-col>
    <v-col class="py-0">
      <ProjectSelect
        :model-value="activityFilterStore.filters.project"
        @update:model-value="(value) => activityFilterStore.updateFilter('project', value)"
      />
    </v-col>
  </v-row>
  <v-row class="pa-4">
    <v-col
      cols="12"
    >
      <h3 class="mb-0">
        {{ __('Group') }}
      </h3>
    </v-col>
    <v-col class="py-0">
      <v-select
        v-col
        :model-value="activityFilterStore.filters.group"
        :items="groupOptions"
        label="Group by"
        :hide-details="true"
        :clearable="true"
        @update:model-value="(value) => activityFilterStore.updateFilter('group', value)"
      />
    </v-col>
  </v-row>
  <v-row class="pa-4">
    <v-col
      cols="12"
    >
      <h3 class="mb-0">
        {{ __('Sort') }}
      </h3>
    </v-col>
    <v-col class="py-0">
      <v-select
        v-col
        :model-value="activityFilterStore.filters.sort"
        :items="sortOptions"
        label="Sort by"
        :hide-details="true"
        @update:model-value="(value) => activityFilterStore.updateFilter('sort', value)"
      />
    </v-col>
  </v-row>
</template>