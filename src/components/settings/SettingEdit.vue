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
      <v-switch
        v-if="SettingType.Boolean === props.setting.type"
        :model-value="props.setting.value === undefined ? props.setting.defaultValue : props.setting.value"
        @update:model-value="onChange"
      />
      <v-btn
        v-else-if="SettingType.Button === props.setting.type"
        class="mt-4"
        @click="props.setting.action"
      >
        {{ props.setting.name }}
      </v-btn>
      <v-textarea
        v-else-if="SettingType.Textarea === props.setting.type"
        :model-value="props.setting.value"
        @update:model-value="onChange"
      />
      <v-text-field
        v-else
        :model-value="props.setting.value"
        :type="props.setting.type"
        autocomplete="off"
        @update:model-value="onChange"
      />
    </v-list-item-action>
  </v-list-item>
</template>