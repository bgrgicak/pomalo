import type Activity from '@/types/activity';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { getTimePassed, getLocalDate, getUtcTimestamp } from '@/helper/date';
import { newId } from '@/data/pouchdb';
import { addEventToActivity, updateEventInActivity } from '@/data/events';
import constants from '@/helper/constants';

interface TimerState {
    activityId: string | undefined;
    time: string;
    loading: boolean;
}

export const useTimerStore = defineStore(
	'timer',
	() => {
		const state: Ref<TimerState> = ref({
			activityId: undefined,
			time: '',
			loading: true,
		});

		const activityStore = useActivityStore();

		const active = computed((): boolean => undefined !== state.value.activityId && '' !== state.value.time);
		const time = computed((): string => state.value.time);
		const isLoading = computed((): boolean => state.value.loading);
		const activityId = computed((): string | undefined => state.value.activityId);
		const currentActivity = computed((): Activity | undefined => {
			if (!state.value.activityId) {
				return undefined;
			}
			return activityStore.list.find((activity) => activity._id === state.value.activityId);
		});
		const title = computed((): string => {
			if (!currentActivity.value) {
				return '';
			}
			return currentActivity.value.title;
		});



		const getCurrentActivity = (): Promise<void | Activity[]> => {
			const now = getUtcTimestamp();
			return activityStore.find({
				'selector': {
					'eventFirstStart': {
						'$lte': now
					},
					'eventLastEnd': {
						'$exists': true
					},
					'timerRunning': true,
				},
			}).then((activities) => {
				if (activities && activities.length > 0) {
					state.value.activityId = activities[0]._id;
				} else {
					state.value.activityId = undefined;
				}
			});
		};

		const calculateTime = (forceActivityCheck: boolean = false) => {
			// TODO reduce calls to getCurrentActivity
			if (forceActivityCheck || 0 === getLocalDate().getSeconds() % 60) {
				getCurrentActivity().then(() => {
					state.value.loading = false;
				});
			}
			if (!currentActivity.value) {
				return '';
			}
			const currentEvent = currentActivity.value.events.find((event) => {
				return !event.end;
			});
			if (!currentEvent) {
				return '';
			}
			state.value.time = getTimePassed(currentEvent.start);
		};
		calculateTime(true);
		setInterval(calculateTime, constants.timer.refreshInterval);

		const stop = () => {
			if (!state.value.activityId) {
				return Promise.resolve();
			}
			return activityStore.get(state.value.activityId).then((activity) => {
				const updatedActivity = activity as Activity;
				updatedActivity.events = updatedActivity.events.map((event) => {
					if (event.end) {
						return event;
					}
					event.end = getLocalDate();
					return event;
				});
				return activityStore.updateFields(
					updatedActivity._id,
					{
						'events': updatedActivity.events,
						'timerRunning': false,
					}
				).then(() => {
					state.value.activityId = undefined;
				});
			});
		};
		const start = (activityId: string) => {
			stop().then(() => {
				activityStore.get(activityId).then((activity) => {
					if (!activity) {
						return;
					}
					const updatedActivity = addEventToActivity(
						activity,
						{
							id: newId('activityEvent'),
							start: getLocalDate(),
						}
					);
					activityStore.updateFields(
						updatedActivity._id,
						{
							'events': updatedActivity.events,
							'timerRunning': true,
						}
					).then(() => {
						state.value.activityId = updatedActivity._id;
					});
				});
			});
		};

		return {
			state,
			active,
			time,
			isLoading,
			activityId,
			currentActivity,
			title,
			start,
			stop,
		};
	},
);
