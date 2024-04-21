<!-- eslint-disable semi -->
<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';
import { watch } from 'vue';
import Squire from 'squire-rte';
import DOMPurify from 'dompurify';
import { useKeyboardStore } from '../../stores/keyboard';

(window as any).DOMPurify = DOMPurify;

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
const emit = defineEmits(['update:modelValue']);

const squire: Ref<Squire|undefined> = ref(undefined);
const focused: Ref<boolean> = ref(false);
const editor: Ref<any> = ref(null);
const textEditorRef: Ref<any> = ref(null);

const updateValue = () => {
	if ( ! squire.value ) {
		return;
	}
	emit('update:modelValue', squire.value.getHTML());
};

watch(
	editor,
	() => {
		if (!editor.value) {
			return;
		}
		squire.value = new Squire(
			editor.value
		);
		squire.value.setHTML( props.modelValue ?? '' );
		squire.value.addEventListener('input', updateValue);
		return () => {
			if ( ! squire.value ) {
				return;
			}
			squire.value.destroy();
		};
	},
);

const focusEditor = () => {
	if (editor.value) {
		editor.value.focus();
	}
};

const editorClick = ( event: any ) => {
	if ( useKeyboardStore().cmdCtrl && event.target.tagName === 'A') {
		window.open(event.target.href, '_blank');
	}
};

const format = ( command: string ) => {
	if ( ! squire.value ) {
		return;
	}
	if (command === 'bold') {
		if (squire.value.hasFormat('b')) {
			squire.value.removeBold();
		} else {
			squire.value.bold();
		}
	} else if (command === 'italic') {
		if (squire.value.hasFormat('i')) {
			squire.value.removeItalic();
		} else {
			squire.value.italic();
		}
	} else if (command === 'underline') {
		if (squire.value.hasFormat('u')) {
			squire.value.removeUnderline();
		} else {
			squire.value.underline();
		}
	} else if (command === 'unordered-list') {
		if (squire.value.hasFormat('li')) {
			squire.value.removeList();
		} else {
			squire.value.makeUnorderedList();
		}
	} else if (command === 'ordered-list') {
		if (squire.value.hasFormat('li')) {
			squire.value.removeList();
		} else {
			squire.value.makeOrderedList();
		}
	} else {
		return;
	}
	updateValue();
};
</script>
<template>
  <v-btn-toggle
    multiple
    class="editor-actions"
  >
    <v-btn @click="() => format('bold')">
      <v-icon>mdi-format-bold</v-icon>
    </v-btn>
    <v-btn @click="() => format('italic')">
      <v-icon>mdi-format-italic</v-icon>
    </v-btn>
    <v-btn @click="() => format('underline')">
      <v-icon>mdi-format-underline</v-icon>
    </v-btn>
    <v-btn @click="() => format('unordered-list')">
      <v-icon>mdi-format-list-bulleted</v-icon>
    </v-btn>
    <v-btn @click="() => format('ordered-list')">
      <v-icon>mdi-format-list-numbered</v-icon>
    </v-btn>
  </v-btn-toggle>
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

	ul{
		margin-left: 1rem;
	}
	ol {
		margin-left: 1.8rem;
	}
}
.editor-actions {
	display: flex;
    border: thin solid rgba(var(--v-border-color), var(--v-disabled-opacity));
	border-radius: 0;
	border-bottom: none;
}
</style>