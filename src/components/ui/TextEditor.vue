<!-- eslint-disable semi -->
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

const addLinks = (value: string) => {
	var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return value.replace(urlRegex, (url) => {
		return '<a href="' + url + '">' + url + '</a>';
	});
};

const createElementFromHTML = (htmlString: string): Node => {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	if (!div.firstChild) {
		return document.createTextNode(htmlString);
	}
	return div.firstChild as Node;
}

const prepare = (value: string) => {
	if (!value) {
		return '';
	}
	return addLinks(value);
};

watch(
	editor,
	() => {
		if (!editor.value) {
			return;
		}
		const peelEditor = pell.init({
			element: editor.value,
			onChange: (html: string) => {
				const newValue = prepare(html);
				emit('update:modelValue', newValue);
			},
			defaultParagraphSeparator: 'p',
			styleWithCSS: false,
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
				content: 'text-editor__content',
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
		peelEditor.content.addEventListener('paste', (event: any) => {
			let paste = event.clipboardData.getData('text');
			paste = addLinks(paste);

			const selection = window.getSelection();
			if (!selection?.rangeCount) {
				return false;
			}
			selection.deleteFromDocument();
			selection.getRangeAt(0).insertNode(createElementFromHTML(paste));

			event.preventDefault();
		});
	},
);

const focusEditor = () => {
	if (editor.value) {
		editor.value.focus();
	}
};

const editorClick = ( event: any ) => {
	if ( ( event.ctrlKey || event.metaKey ) && event.target.tagName === 'A') {
		window.open(event.target.href, '_blank');
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
      class="text-editor__inner"
      @click="editorClick"
    />
  </v-input>
</template>
<style lang="scss">
$text-editor-height: 400px;
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
	.text-editor__inner,
	.text-editor__content {
		font-size: 1rem;
		width: 100%;
		min-height: $text-editor-height;
		outline: none;
		overflow: hidden;
	}
	.text-editor__content > * {
		inline-size: 100%;
  		overflow-wrap: break-word;
	}
	.v-input__details {
		display: none;
	}
}
</style>