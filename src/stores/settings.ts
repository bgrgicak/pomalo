import constants from '@/helper/constants';
import type { SettingsState, Setting } from '@/types/setting';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';


export const useSettingsStore = defineStore(
    'settings',
    () => {
        const state: Ref<SettingsState> = ref({
            settings: {},
        });

        const settings = computed((): Object => state.value.settings);

        const load = () => {
            const localStorageSettings = localStorage.getItem(
                constants.localStorage.settingsKey
            );
            if (null !== localStorageSettings) {
                state.value.settings = JSON.parse(
                    localStorageSettings
                );
            }
        };
        load();

        const get = (id: string): any => {
            if (!state.value.settings) {
                load();
            }
            return state.value.settings[id];
        };

        const update = (id: string, value: any) => {
            state.value.settings[id] = value;
        };

        const save = () => {
            localStorage.setItem(
                constants.localStorage.settingsKey,
                JSON.stringify(state.value.settings)
            );
        };

        return {
            state,
            settings,
            get,
            update,
            save
        };
    },
);
