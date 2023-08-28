<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';

import '@vueup/vue-quill/dist/vue-quill.bubble.css';

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

const focused: Ref<boolean> = ref(false);
const editor: Ref<any> = ref(null);

const onChange = (value: string) => {
	emit('update:modelValue', value);
};
var toolbarOptions = [
	['bold', 'italic', 'underline', 'strike', 'code-block'],

	[{ 'header': 1 }, { 'header': 2 }],
	[{ 'list': 'ordered'}, { 'list': 'bullet' }],
	[{ 'script': 'sub'}, { 'script': 'super' }],
];
const focusEditor = () => {
	if (editor.value) {
		editor.value.focus();
	}
};
</script>
<template>
  <v-input
    class="text-editor mb-8 pa-4"
    :class="{'text-editor--focused': focused}"
    :focused="focused"
    @click="focusEditor"
  >
    <QuillEditor
      ref="editor"
      theme="bubble"
      :content="props.modelValue"
      content-type="html"
      :read-only="props.readonly"
      :toolbar="toolbarOptions"
      @update:content="onChange"
      @keyup="(value: string) => emit('keyup', value)"
      @focus="focused = true"
      @blur="focused = false"
    />
  </v-input>
</template>
<style lang="scss">
.text-editor {
	overflow: visible !important;
	min-height: 200px;
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
    &:hover,
    &.text-editor--focused  {
        border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
    }
    &.text-editor--focused {
        border-width: 2px;
    }
	.ql-container {
		font-size: 1rem;
		width: 100%;
	}
	.ql-editor {
		overflow: visible;
		padding: 0;
	}
	.ql-tooltip {
		z-index: 1;
	}
}
</style>