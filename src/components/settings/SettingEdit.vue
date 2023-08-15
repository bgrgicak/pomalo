<script setup lang="ts">
import { SettingType, type Setting } from '@/types/setting';

const props = defineProps<{
    setting: Setting;
}>();
const emit = defineEmits(['onChange']);

const onChange = (value: unknown) => {
    emit(
        'onChange',
        props.setting.id,
        value,
    );
};
</script>
<template>
    <v-list-item>
        <v-list-item-title>{{ props.setting.label ?? props.setting.name }}</v-list-item-title>
        <v-list-item-action>
            <v-switch v-if="SettingType.Boolean === props.setting.type"
                      :model-value="props.setting.value"
                      @update:model-value="onChange" />
            <v-btn v-else-if="SettingType.Button === props.setting.type"
                   @click="props.setting.action"
                   class="mt-4">
                {{ props.setting.name }}
            </v-btn>
            <v-text-field v-else
                          :model-value="props.setting.value"
                          :type="props.setting.type"
                          @update:model-value="onChange"
                          autocomplete="off" />
        </v-list-item-action>
    </v-list-item>
</template>