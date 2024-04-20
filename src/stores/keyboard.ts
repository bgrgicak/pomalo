import { defineStore } from 'pinia';
import { type Ref, computed, ref } from 'vue';

interface KeyboardState {
	cmdCtrl: boolean;
}

export const useKeyboardStore = defineStore('keyboard', () => {
	const state: Ref<KeyboardState> = ref({
		cmdCtrl: false,
	});

	const cmdCtrl = computed(() => state.value.cmdCtrl);

	const isCmdCtrl = (event: KeyboardEvent) => {
		return ['Meta', 'Control'].includes(event.key);
	};
	window.addEventListener('keydown', (event) => {
		if (isCmdCtrl(event)) {
			state.value.cmdCtrl = true;
		}
	});

	window.addEventListener('keyup', (event) => {
		if (isCmdCtrl(event)) {
			state.value.cmdCtrl = false;
		}
	});

	return {
		cmdCtrl,
	};
});
