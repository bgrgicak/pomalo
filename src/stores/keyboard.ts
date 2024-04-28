import { defineStore } from 'pinia';
import { type Ref, computed, ref } from 'vue';

interface KeyboardState {
	cmdCtrl: boolean;
	isTouch: boolean;
}

export const useKeyboardStore = defineStore('keyboard', () => {
	const state: Ref<KeyboardState> = ref({
		cmdCtrl: false,
		isTouch: false,
	});

	const cmdCtrl = computed(() => state.value.cmdCtrl);
	const isTouch = computed(() => state.value.isTouch);

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

	window.addEventListener('touchstart', () => {
		state.value.isTouch = true;
	});

	return {
		cmdCtrl,
		isTouch,
	};
});
