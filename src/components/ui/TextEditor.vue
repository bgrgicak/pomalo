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
	disableUpload: {
		type: Boolean,
		default: true,
	},
});
const emit = defineEmits(['update:modelValue']);

const squire: Ref<Squire|undefined> = ref(undefined);
const focused: Ref<boolean> = ref(false);
const editor: Ref<any> = ref(null);
const textEditorRef: Ref<any> = ref(null);

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
		squire.value.addEventListener('input', () => {
			if ( ! squire.value ) {
				return;
			}
			emit('update:modelValue', squire.value.getHTML());
		});
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