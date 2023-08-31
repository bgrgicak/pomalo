import type Activity from '@/types/activity';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useActivityStore } from './activities';
import { getTimePassed, getLocalDate, getUtcTimestamp } from '@/helper/date';
import { newId } from '@/data/pouchdb';
import { addEventToActivity, updateEventInActivity } from '@/data/events';
import constants from '@/helper/constants';

interface TimerState {
    time: string;
    loading: boolean;
}

export const useTimerStore = defineStore(
	'timer',
	() => {
		const state: Ref<TimerState> = ref({
			time: '',
			loading: true,
		});

		const activityStore = useActivityStore();

		const time = computed((): string => state.value.time);
		const isLoading = computed((): boolean => state.value.loading);
		const currentActivity = computed((): Activity | undefined => activityStore.currentActivity);
		const activityId = computed((): string | undefined => currentActivity.value ? currentActivity.value._id : undefined);
		const active = computed((): boolean => undefined !== activityId.value && '' !== state.value.time);
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
			});
		};
		getCurrentActivity();

		const calculateTime = () => {
			if (!currentActivity.value) {
				state.value.time = '';
				return;
			}
			const currentEvent = currentActivity.value.events.find((event) => {
				return !event.end;
			});
			if (!currentEvent) {
				state.value.time = '';
				return;
			}
			state.value.time = getTimePassed(currentEvent.start);
		};
		calculateTime();
		setInterval(calculateTime, constants.timer.refreshInterval);

		const stop = () => {
			if (!activityId.value) {
				return Promise.resolve();
			}
			return activityStore.get(activityId.value).then((activity) => {
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
				);
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
					);
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
