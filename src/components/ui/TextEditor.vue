<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';
import pell from 'pell';
import { watch } from 'vue';

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

watch(
	editor,
	() => {
		if (!editor.value) {
			return;
		}
		const peelEditor = pell.init({
			element: editor.value,
			onChange: (html: string) => {
				emit('update:modelValue', html);
			},
			defaultParagraphSeparator: 'p',
			styleWithCSS: true,
			actions: [
				'bold',
				'underline',
				{
					name: 'italic',
					result: () => pell.exec('italic')
				},
				{
					name: 'image',
					result: () => {
						const url = window.prompt('Enter the image URL');
						if (url) pell.exec('insertImage', url);
					}
				},
				{
					name: 'link',
					result: () => {
						const url = window.prompt('Enter the link URL');
						if (url) pell.exec('createLink', url);
					}
				}
			],
			classes: {
				actionbar: 'v-btn-group v-btn-group--density-default v-btn-toggle mb-4',
				button: 'v-btn v-btn--flat v-btn--icon v-btn--density-default v-btn--size-default v-btn--variant-outlined',
				content: 'texteditor__content',
				selected: 'v-btn--active'
			}
		});
		peelEditor.content.innerHTML = props.modelValue;
		peelEditor.content.addEventListener('focus', () => {
			focused.value = true;
		});
		peelEditor.content.addEventListener('blur', () => {
			focused.value = false;
		});
	},
);

const focusEditor = () => {
	if (editor.value) {
		editor.value.focus();
	}
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
    <pre
      ref="editor"
      class="texteditor__inner"
    />
  </v-input>
</template>
<style lang="scss">
$texeditor-height: 400px;
.text-editor {
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
	.v-input__control {
		padding: 1rem;
        border: 2px solid transparent;
	}


	.pell-actionbar {
		display: none;
	}
    &:hover,
    &.text-editor--focused  {
        border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
    }
    &.text-editor--focused {
		.v-input__control {
        	border-color: rgba(var(--v-border-color), var(--v-field-border-opacity));
		}
		.pell-actionbar {
			display: flex;
		}
    }
	.texteditor__inner,
	.texteditor__content {
		font-size: 1rem;
		width: 100%;
		min-height: $texeditor-height;
		outline: none;
	}
	.v-input__details {
		display: none;
	}
}
</style>