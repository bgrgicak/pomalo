<script setup lang="ts">
import __ from '@/helper/translations';
import { ref } from 'vue';
import ProjectSelect from '../project/ProjectSelect.vue';

const filters = ref({
	showCompleted: false,
	project: undefined,
	groupBy: undefined,
	sortBy: undefined,
});

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
  <v-row class="pa-4">
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
        v-model="filters.showCompleted"
        label="Show completed"
        color="primary"
        :hide-details="true"
      />
    </v-col>
    <v-col class="py-0">
      <ProjectSelect
        v-model="filters.project"
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
        v-model="filters.groupBy"
        v-col
        :items="groupOptions"
        label="Group by"
        :hide-details="true"
        :clearable="true"
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
        v-model="filters.sortBy"
        v-col
        :items="sortOptions"
        label="Sort by"
        :hide-details="true"
      />
    </v-col>
  </v-row>
</template>