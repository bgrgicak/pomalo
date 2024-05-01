<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';
import { ref } from 'vue';
import router from '@/router/router';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { getEventFromActivity, newEvent, removeEventFromActivity, updateEventInActivity } from '@/data/events';
import CalendarHeader from './CalendarHeader.vue';
import { getLocalDate, getUtcTimestamp, isValidDate, minutesBetweenDates } from '@/helper/date';
import { computed } from 'vue';
import { CalendarClipboardType, type CalendarEvent } from '@/types/calendar';
import { useNoticeStore } from '@/stores/notices';
import { NoticeType } from '@/types/notice';
import CalendarMain from './CalendarMain.vue';
import { allViews, defaultView, defaultSmallView } from '@/plugins/vuecal';
import { watch } from 'vue';
import { addEventToActivity, newCalendarEvent } from '@/data/events';
import { settings } from '@/helper/settings';
import { useKeyboardStore } from '../../stores/keyboard';

const allowedViews = computed(() => {
	return structuredClone(allViews).filter(
		(view: string) => {
			if ('years' === view) {
				return false;
			}
			return true;
		}
	);
});

const initialActiveView = () => {
	const view = router.currentRoute.value.query.view?.toString() ?? defaultView;
	if (!allowedViews.value.includes(view)) {
		return defaultSmallView;
	}
	return view;
};

const calendarStore = useCalendarStore();
const activityStore = useActivityStore();
const layoutStore = useLayoutStore();
const noticeStore = useNoticeStore();

const activeView = ref(initialActiveView());

const vuecalRef = ref(null);

watch(
	allowedViews,
	(allowedViews) => {
		if (!allowedViews.includes(activeView.value)) {
			activeView.value = defaultSmallView;
		}
	}
);

const selectedDate = computed(() => {
	if (!router.currentRoute.value.query.date) {
		return getLocalDate();
	}
	const date = getLocalDate(
		parseInt(
            router.currentRoute.value.query.date as string,
		)
	);
	if (!isValidDate(date)) {
		return getLocalDate();
	}
	return date;
});

const vuecal = computed(() => {
	if (!vuecalRef.value) {
		return undefined;
	}
	return (vuecalRef.value as any).$refs.vuecalRef;
});

const onKeyboardEvent = (keyboardEvent: any) => {
	maybeCopyPasteEvent(keyboardEvent);
	maybeDeleteEvent(keyboardEvent);
};

const maybeCopyPasteEvent = (keyboardEvent: any) => {
	if ('Escape' === keyboardEvent.key) {
		calendarStore.unfocusAllEvents();
		layoutStore.hideRightSidebar();
		return;
	}
	if (!useKeyboardStore().cmdCtrl) {
		return;
	}
	if ('v' === keyboardEvent.key) {
		if (calendarStore.clipboard && calendarStore.focusedCell && isValidDate(calendarStore.focusedCell)) {
			const activityEvents: { [key: string]: string[] } = {};
			const sortedEvents = calendarStore.clipboard.events.sort((a, b) => {
				if (!a.start || !b.start) {
					return 0;
				}
				return a.start.getTime() - b.start.getTime();
			});
			for (const event of sortedEvents) {
				if (!event.id) {
					continue;
				}
				if (!activityEvents[event.id]) {
					activityEvents[event.id] = [];
				}
				activityEvents[event.id].push(event.eventId);
			}
			const firstEventStart = sortedEvents[0].start;
			for (const activityId in activityEvents) {
				activityStore.get(activityId).then((activity: Activity | void) => {
					if (!activity) {
						return;
					}

					let updateActivity = Object.assign({}, activity);
					for (const eventId of activityEvents[activityId]) {
						const event = getEventFromActivity(activity, eventId);
						if (!event) {
							return;
						}
						if (!event.start) {
							return;
						}
						if (!event.end) {
							useNoticeStore().addNotice({
								type: NoticeType.Info,
								title: __('Could not paste in progress event.'),
							});
							return;
						}

						const minutesBetween = minutesBetweenDates(
							event.start,
							firstEventStart
						);

						const start = calendarStore.focusedCell!.addMinutes(
							minutesBetween
						);
						const end = start.addMinutes(
							minutesBetweenDates(
								event.end,
								event.start
							)
						);

						if (CalendarClipboardType.Cut === calendarStore.clipboard!.type) {
							updateActivity = removeEventFromActivity(
								updateActivity,
								eventId,
							);
						}
						updateActivity = addEventToActivity(
							updateActivity,
							newEvent(
								start,
								end,
							)
						);
					}

					activityStore.update(
						updateActivity
					).then(() => {
						calendarStore.removeFromClipboard();
					});
				});
			}
		}
	}

	let clipboardAction;
	if ('c' === keyboardEvent.key) {
		clipboardAction = CalendarClipboardType.Copy;
	} else if ('x' === keyboardEvent.key) {
		clipboardAction = CalendarClipboardType.Cut;
	}
	if (clipboardAction) {
		console.log(calendarStore.focusedEvents);
		calendarStore.addToClipboard(
			calendarStore.focusedEvents,
			clipboardAction
		);
	}
};

const maybeDeleteEvent = (keyboardEvent: any) => {
	if (!['Backspace', 'Delete'].includes(keyboardEvent.key)) {
		return;
	}

	if (!calendarStore.focusedEvents) {
		return;
	}
	removeEvents(calendarStore.focusedEvents);
};

const removeEvents = (events: CalendarEvent[]) => {
	const activityEvents: { [key: string]: string[] } = {};
	for (const event of events) {
		if (!event.id) {
			continue;
		}
		if (!activityEvents[event.id]) {
			activityEvents[event.id] = [];
		}
		activityEvents[event.id].push(event.eventId);
	}
	for (const activityId in activityEvents) {
		activityStore.get(activityId).then((activity: Activity | void) => {
			if (!activity) {
				return;
			}
			if (activity.readonly) {
				noticeStore.addNotice({
					type: NoticeType.Warning,
					title: __('Cannot delete readonly event.'),
				});
				return;
			}
			let updatedActivity = Object.assign({}, activity );
			if (!updatedActivity) {
				return;
			}
			for (const eventId of activityEvents[activityId]) {
				updatedActivity = removeEventFromActivity(
					updatedActivity,
					eventId
				);
			}

			activityStore.update(
				updatedActivity
			);
		});
	}
};

const updateEvent = (activityId: string, event: any, repeatIteration: boolean = false) => {
	activityStore.get(activityId).then((activity: Activity | void) => {
		if (!activity) {
			return;
		}
		activityStore.update(
			updateEventInActivity(
				activity,
				event,
				repeatIteration
			)
		);
	});
};

const addEvent = (start?: Date, end?: Date) => {
	if (!start) {
		start = getLocalDate();
	}
	if (!end) {
		end = start.addMinutes(settings.defaultEventDurationInMinutes);
	}

	calendarStore.addNewEvent(
		{
			...newCalendarEvent(
				start,
				end,
			),
			class: 'v-card calendar-event__new',
			new: true,
		}
	);
};

const fetch = (start: Date, end: Date) => {
	calendarStore.load(start, end);
	if (start && isValidDate(start) && activeView.value) {
		router.push({
			query: {
				...router.currentRoute.value.query,
				date: getUtcTimestamp(start),
				view: activeView.value ?? 'week',
			}
		});
	}
};
</script>
<template>
  <v-card
    class="calendar pa-4"
    @keydown="onKeyboardEvent"
  >
    <CalendarHeader
      v-model:active-view="activeView"
      :vuecal="vuecal"
      :views="allowedViews"
      @addEvent="addEvent"
    />
    <CalendarMain
      ref="vuecalRef"
      v-model:active-view="activeView"
      :views="allowedViews"
      :vuecal="vuecal"
      :selected-date="selectedDate"
      @addEvent="addEvent"
      @updateEvent="updateEvent"
      @fetchEvents="fetch"
    />
  </v-card>
</template>