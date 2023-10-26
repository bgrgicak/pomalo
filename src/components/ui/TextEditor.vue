<script setup lang="ts">
import __ from '@/helper/translations';
import { ref, type PropType, type Ref } from 'vue';

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
// Prevent value changes from triggering an update
const value = props.modelValue;

const onChange = (payload: any) => {
	emit('update:modelValue', payload?.originalTarget.innerHTML ?? '');
};
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
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="text-editor__inner"
      :contenteditable="!props.readonly"
      @keyup="onChange"
      @focus="focused = true"
      @blur="focused = false"
      v-html="value"
    />
    <!--eslint-enable-->
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
	textarea {
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