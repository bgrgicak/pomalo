<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';

import 'tinymce/tinymce';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/link';
import 'tinymce/plugins/paste';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.css';
import Editor from '@tinymce/tinymce-vue';

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
const emit = defineEmits(['update:modelValue']);

const focused: Ref<boolean> = ref(false);
const editor: Ref<any> = ref(null);
const textEditorRef: Ref<any> = ref(null);

const onChange = (value: string) => {
	emit('update:modelValue', value);
};
const focusEditor = () => {
	if (editor.value) {
		editor.value.focus();
	}
};

const options = {
	plugins: 'lists link codesample paste',
	toolbar: 'bold italic underline link codesample | bullist numlist',
	menubar: false,
	paste_as_text: true,
	skin: false,
	content_css: false,
};
</script>
<template>
  <v-input
    ref="textEditorRef"
    class="text-editor mb-8"
    :class="{'text-editor--focused': focused}"
    :focused="focused"
    @click="focusEditor"
  >
    <Editor
      :disabled="props.readonly"
      :init="options"
      :model-value="props.modelValue"
      :inline="true"
      tag-name="div"
      @update:model-value="onChange"
      @focus="focused = true"
      @blur="focused = false"
    />
  </v-input>
</template>
<style lang="scss">

.text-editor {
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
	.v-input__control {
		padding: 1rem;
        border: 2px solid transparent;
	}
    &:hover,
    &.text-editor--focused  {
        border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
    }
    &.text-editor--focused {
		.v-input__control {
        	border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
		}
    }
	.mce-content-body {
		font-size: 1rem;
		width: 100%;
		min-height: 200px;
		outline: none;
	}
	.v-input__details {
		display: none;
	}
}
</style>