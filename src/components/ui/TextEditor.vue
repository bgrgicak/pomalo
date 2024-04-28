<!-- eslint-disable semi -->
<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';
import { watch } from 'vue';
import Squire from 'squire-rte';
import DOMPurify from 'dompurify';
import { useKeyboardStore } from '../../stores/keyboard';

(window as any).DOMPurify = DOMPurify;

enum Format {
	bold = 'b',
	italic = 'i',
	underline = 'u',
	unorderedList = 'li',
	strikethrough = 's',
}

const formatOptions = {
	[Format.bold]: {
		icon: 'mdi-format-bold',
	},
	[Format.italic]: {
		icon: 'mdi-format-italic',
	},
	[Format.underline]: {
		icon: 'mdi-format-underline',
	},
	[Format.unorderedList]: {
		icon: 'mdi-format-list-bulleted',
	},
	[Format.strikethrough]: {
		icon: 'mdi-format-strikethrough-variant',
	},
};

const props = defineProps({
	modelValue: {
		type: String as PropType<string>,
		default: undefined,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['update:modelValue', 'paste']);

const squire: Ref<Squire|undefined> = ref(undefined);
const focused: Ref<boolean> = ref(false);
const editor: Ref<any> = ref(null);
const textEditorRef: Ref<any> = ref(null);
const activeFormats: Ref<Format[]> = ref([]);

const keyboardStore = useKeyboardStore();

const updateValue = () => {
	if ( ! squire.value ) {
		return;
	}
	const value = squire.value!.getHTML();
	if (props.modelValue === value) {
		return;
	}
	emit('update:modelValue', squire.value!.getHTML());
};

const updateFormat = () => {
	const newFormats = [];
	for (const format in Format) {
		const formatValue = Format[format as keyof typeof Format];
		if (squire.value!.hasFormat(formatValue)) {
			newFormats.push(formatValue);
		}
	}
	activeFormats.value = newFormats;
}

const pathChange = () => {
	updateFormat();
};

watch(
	editor,
	() => {
		if (!editor.value) {
			return;
		}
		if (props.readonly) {
			editor.value.innerHTML = DOMPurify.sanitize(props.modelValue ?? '');
			return;
		}
		squire.value = new Squire(
			editor.value,
			{
				blockTag: 'p',
			}
		);
		squire.value.setHTML( props.modelValue ?? '' );
		squire.value.addEventListener('input', updateValue);
		squire.value.addEventListener('pathChange', pathChange);
		squire.value.addEventListener('willPaste', () => {
			emit('paste');
		});
		squire.value.setKeyHandler('Ctrl-Shift-X', null as any);
		squire.value.setKeyHandler('Meta-Shift-X', null as any);
		squire.value.setKeyHandler('Ctrl-Shift-X', () => {
			format(Format.strikethrough);
		});
		squire.value.setKeyHandler('Meta-Shift-X', () => {
			format(Format.strikethrough);
		});
		return () => {
			if ( ! squire.value ) {
				return;
			}
			squire.value.destroy();
		};
	},
);

const focusEditor = (event: any) => {
	if ( props.readonly ) {
		event.preventDefault();
		return;
	}
	if (editor.value) {
		editor.value.focus();
	}
};

const editorClick = ( event: any ) => {
	if (
		(
			keyboardStore.isTouch ||
			keyboardStore.cmdCtrl
		) && event.target.tagName === 'A'
	) {
		window.open(event.target.href, '_blank');
	}
};

const format = ( format: Format ) => {
	if ( ! squire.value ) {
		return;
	}
	if (format === Format.bold) {
		if (squire.value.hasFormat('b')) {
			squire.value.removeBold();
		} else {
			squire.value.bold();
		}
	} else if (format === Format.italic) {
		if (squire.value.hasFormat('i')) {
			squire.value.removeItalic();
		} else {
			squire.value.italic();
		}
	} else if (format === Format.underline) {
		if (squire.value.hasFormat('u')) {
			squire.value.removeUnderline();
		} else {
			squire.value.underline();
		}
	}  else if ( format === Format.strikethrough ) {
		if (squire.value.hasFormat('s')) {
			squire.value.removeStrikethrough();
		} else {
			squire.value.strikethrough();
		}
	} else if (format === Format.unorderedList) {
		if (squire.value.hasFormat('li')) {
			squire.value.removeList();
		} else {
			squire.value.makeUnorderedList();
		}
	} else {
		return;
	}
	updateValue();
};
</script>
<template>
  <v-btn-toggle
    v-if="!readonly"
    v-model:model-value="activeFormats"
    multiple
    class="editor-actions"
  >
    <v-btn
      v-for="(option, key) in formatOptions"
      :key="key"
      :icon="option.icon"
      :class="{'v-btn--active': activeFormats.includes(key as Format)}"
      @click="format(key as Format)"
    />
  </v-btn-toggle>
  <v-input
    ref="textEditorRef"
    class="text-editor mb-8"
    :class="{'text-editor--focused': focused}"
    :focused="focused"
    :readonly="readonly"
    @click="focusEditor"
  >
    <div
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

	ul{
		margin-left: 1rem;
	}
	ol {
		margin-left: 1.8rem;
	}
	li {
		direction: ltr;
	}
}
.editor-actions {
	display: flex;
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
	border-radius: 0;
	border-bottom: none;
}
</style>