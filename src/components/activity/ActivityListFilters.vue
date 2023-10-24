<script setup lang="ts">
import __ from '@/helper/translations';
import { useActivityFilterStore } from '@/stores/activity-filters';
import { ActivityFilterGroup, ActivityFilterSort, ActivityFilterStatus } from '@/types/activity-filter';
import ProjectSelect from '../project/ProjectSelect.vue';

const activityFilterStore = useActivityFilterStore();

const statusOptions = [
	{
		'title': __('Any'),
		'value': ActivityFilterStatus.Any,
	},
	{
		'title': __('Completed'),
		'value': ActivityFilterStatus.Completed,
	},
	{
		'title': __('Not completed'),
		'value': ActivityFilterStatus.NotCompleted,
	}
];

const groupOptions = [
	{
		'title': 'Completed',
		'value': ActivityFilterGroup.Completed,
	},
	{
		'title': 'Project',
		'value': ActivityFilterGroup.Project,
	}
];

const sortOptions = [
	{
		'title': 'Priority',
		'value': ActivityFilterSort.Priority,
	},
	{
		'title': 'Name',
		'value': ActivityFilterSort.Name,
	},
	{
		'title': 'Due date',
		'value': ActivityFilterSort.DueDate,
	},
	{
		'title': 'Created',
		'value': ActivityFilterSort.Created,
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
      <v-select
        v-col
        :model-value="activityFilterStore.filters.status"
        :items="statusOptions"
        label="Status"
        :hide-details="true"
        @update:model-value="(value) => activityFilterStore.updateFilter('status', value)"
      />
    </v-col>
    <v-col class="py-0">
      <ProjectSelect
        :model-value="activityFilterStore.filters.project"
        :clearable="true"
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
  <v-row class="px-4">
    <v-col
      cols="12"
      class="text-center"
    >
      <v-btn
        color="primary"
        :block="true"
        @click="() => activityFilterStore.setDefaults()"
      >
        {{ __('Set as default') }}
      </v-btn>
    </v-col>
  </v-row>
</template>