<script setup lang="ts">
import __ from '@/helper/translations';
import type Activity from '@/types/activity';
import { watch } from 'vue';
import { ref, type PropType, type Ref } from 'vue';
// @ts-ignore-next-line
import MediumEditor from 'vuejs-medium-editor';


const props = defineProps({
	modelValue: {
		type: String as PropType<string>,
		default: undefined,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	disableUpload: {
		type: Boolean,
		default: true,
	},
}); 
const emit = defineEmits(['keyup', 'update:modelValue']);

const prefill: Ref<string|undefined> = ref(props.modelValue);
const focused: Ref<boolean> = ref(false);
const editor = ref(null);

watch(
	editor,
	(newEditor: any) => {
		if (!newEditor.editor) {
			return;
		}
		newEditor.editor.subscribe('focus', () => {
			focused.value = true;
		});
		newEditor.editor.subscribe('blur', () => {
			focused.value = false;
		});
	},
);

const options = {
	toolbar: {
		buttons: [
			'bold',
			'italic',
			'underline',
			'quote',
			'h1',
			'h2',
			'h3',
			'pre',
			'unorderedlist',
		]
	}
};
const onChange = (value: string) => {
	emit('update:modelValue', value);
};
</script>
<template>
  <v-input
    class="text-editor mb-8 pa-4"
    :class="{'text-editor--focused': focused}"
    :focused="focused"
  >
    <medium-editor
      ref="editor"
      :prefill="prefill"
      :read-only="props.readonly"
      :options="options"
      :on-change="onChange"
      :hide-image="props.disableUpload"
      :hide-gists="props.disableUpload"
      :hide-video="props.disableUpload"
      @keyup="(value: string) => emit('keyup', value)"
      @click="focused = true"
    />
  </v-input>
</template>
<style scoped lang="scss">
.text-editor {
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
    &:hover,
    &.text-editor--focused  {
        border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
    }
    &.text-editor--focused {
        border-width: 2px;
    }

}
</style>