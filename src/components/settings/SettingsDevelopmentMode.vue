<script setup lang="ts">
import SettingEdit from './SettingEdit.vue';
import { SettingType, type Setting } from '@/types/setting';
import __ from '@/helper/translations';
import { removeAllIndexes } from '@/data/pouchdb';
import database from '@/data/pouchdb';
import { reParseAllDocuments } from '@/data/activities';
import { forceCalendarSync, removeAllCalendarEvents } from '@/data/events';

const removeAllIndexesFromDatabase = () => removeAllIndexes(database);

const actions: Setting[] = [
	{
		id: 'reParseAllDocuments',
		label: __('Recalculate all documents'),
		name: __('Recalculate'),
		action: reParseAllDocuments,
		type: SettingType.Button,
	},
	{
		id: 'removeAllIndexes',
		label: __('Remove all indexes'),
		name: __('Remove indexes'),
		action: removeAllIndexesFromDatabase,
		type: SettingType.Button,
	},
	{
		id: 'removeAllCalendarEvents',
		label: __('Remove all calendar events'),
		name: __('Remove calendar events'),
		action: removeAllCalendarEvents,
		type: SettingType.Button,
	},
	{
		id: 'forceCalendarSync',
		label: __('Force calendar sync'),
		name: __('Force sync'),
		action: forceCalendarSync,
		type: SettingType.Button,
	}
];
</script>
<template>
  <v-row>
    <v-col cols="12">
      <h2>{{ __('Debug') }}</h2>
    </v-col>
    <v-col cols="12">
      <v-row
        v-for="action in actions"
        :key="action.id"
      >
        <v-list class="d-flex flex-column">
          <SettingEdit :setting="action" />
        </v-list>
      </v-row>
      <v-spacer />
    </v-col>
    <v-spacer />
  </v-row>
</template>