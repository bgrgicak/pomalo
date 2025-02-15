<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import SettingEdit from './SettingEdit.vue';
import settingsStructure from './settings';
import { addDefaultsToSetting } from '@/data/settings';
import type { Setting } from '@/types/setting';
import __ from '@/helper/translations';
import constants from '@/helper/constants';
import SettingsDevelopmentMode from './SettingsDevelopmentMode.vue';

const settingsStore = useSettingsStore();

const onChange = (id: string, value: any) => {
	settingsStore.update(id, value);
};

const prepareSetting = (setting: Setting) => {
	return addDefaultsToSetting({
		...setting,
		value: settingsStore.settings[setting.id as keyof typeof settingsStore.settings] ?? setting.defaultValue,
	});
};
</script>
<template>
  <v-container class="settings">
    <v-row
      v-for="(group, groupKey) in settingsStructure"
      :key="groupKey"
    >
      <v-col cols="12">
        <h2>{{ group.title }}</h2>
      </v-col>
      <v-col cols="12">
        <v-row
          v-for="(section, sectionKey) in group"
          :key="sectionKey"
        >
          <v-list
            v-if="'title' !== sectionKey"
            class="d-flex flex-column"
          >
            <SettingEdit
              v-for="setting in section.settings"
              :key="setting.id"
              :setting="prepareSetting(setting)"
              @onChange="onChange"
            />
          </v-list>
        </v-row>
        <v-spacer />
      </v-col>
      <v-spacer />
    </v-row>
    <v-row class="mt-12">
      <v-col cols="12">
        <v-btn
          color="primary"
          @click="settingsStore.save"
        >
          {{ __('Save') }}
        </v-btn>
      </v-col>
    </v-row>
    <SettingsDevelopmentMode v-if="constants.environment.development" />
  </v-container>
</template>
<style lang="scss">
@import '@/styles/variables.scss';
.settings.v-container {
    overflow-y: auto;
    max-width: 100%;

    .v-list {
        max-width: 1000px;
        width: 100%;
    }
}
</style>
