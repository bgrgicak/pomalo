import router from '@/router/router';
import type Activity from '@/types/activity';
import type { ActivityEvent, ActivityType } from '@/types/activity';
import type { LayoutState } from '@/types/layout';
import { defineStore } from 'pinia';
import { type Ref, computed, ref } from 'vue';
import { useActivityStore } from './activities';

export const useLayoutStore = defineStore(
	'layout',
	() => {

		const state: Ref<LayoutState> = ref({
			leftSidebarVisibility: false,
			menuVisibility: undefined,
			current: {},
		});

		const activityStore = useActivityStore();

		const currentActivityId = computed(() => router.currentRoute.value.query.preview as string | undefined);
		const currentActivity = computed(() => currentActivityId.value ? activityStore.activities[currentActivityId.value] : undefined);

		const currentEventId = computed(() => router.currentRoute.value.query.previewEvent as string | undefined);
		const currentEvent = computed(() => {
			if(state.value.current.event) {
				return state.value.current.event;
			}
			if(currentActivity.value && currentEventId.value) {
				return currentActivity.value.events.find((event) => event.id === currentEventId.value);
			}
			return undefined;
		});
		const newActivityType = computed(() => state.value.current.type);

		const isMenuVisible = computed(() => state.value.menuVisibility);
		const isLeftSidebarVisible = computed(() => state.value.leftSidebarVisibility);
		const isRightSidebarVisible = computed(() =>
			currentActivityId.value !== undefined
			|| currentEventId.value !== undefined
		);

		const showLeftSidebar = () => {
			state.value.leftSidebarVisibility = true;
		};
		const hideLeftSidebar = () => {
			state.value.leftSidebarVisibility = false;
		};

		const setPreviewItem = (activityId?: string, eventId?: string) => {
			router.push({
				query: {
					...router.currentRoute.value.query,
					preview: activityId,
					previewEvent: eventId,
				}
			});
		};
		const showRightSidebar = (activityId: string | undefined = undefined, event: ActivityEvent | undefined = undefined) => {
			state.value.current = {
				event
			};
			setPreviewItem(activityId, event?.id);
		};
		const showRightSidebarNewActivity = (type: ActivityType) => {
			state.value.current = {
				type
			};
		};
		const hideRightSidebar = () => {
			setPreviewItem();
		};

		const toggleRightSidebar = () => {
			if (isRightSidebarVisible.value) {
				hideRightSidebar();
			} else {
				showRightSidebar();
			}
		};

		const updateMenuVisibility = (visible: boolean) => {
			state.value.menuVisibility = visible;
		};
		return {
			state,
			currentActivityId,
			currentActivity,
			currentEventId,
			currentEvent,
			newActivityType,
			isLeftSidebarVisible,
			isRightSidebarVisible,
			isMenuVisible,
			showLeftSidebar,
			hideLeftSidebar,
			showRightSidebar,
			showRightSidebarNewActivity,
			hideRightSidebar,
			toggleRightSidebar,
			updateMenuVisibility,
		};
	}
);
