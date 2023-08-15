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
        value: settingsStore.settings[setting.id as keyof typeof settingsStore.settings],
    });
};
</script>
<template>
    <v-container>
        <v-row v-for="(group, groupKey) in settingsStructure"
               :key="groupKey">
            <v-col cols="12">
                <h2>{{ group.title }}</h2>
            </v-col>
            <v-col cols="12">
                <v-row v-for="(section, sectionKey) in group">
                    <v-list v-if="'title' !== sectionKey"
                            class="d-flex flex-column">
                        <SettingEdit v-for="setting in section.settings"
                                     :key="setting.id"
                                     :setting="prepareSetting(setting)"
                                     @onChange="onChange" />
                    </v-list>
                </v-row>
                <v-spacer />
            </v-col>
            <v-spacer />
        </v-row>
        <SettingsDevelopmentMode v-if="constants.environment.development" />
        <v-row class="mt-12">
            <v-col cols="12">
                <v-btn @click="settingsStore.save"
                       color="primary">
                    {{ __('Save') }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>