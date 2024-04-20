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
import { CalendarClipboardType } from '@/types/calendar';
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
			for (const clipboardEvent of calendarStore.clipboard!.events) {
				if (!clipboardEvent.id){
					continue;
				}
				activityStore.get(clipboardEvent.id).then((activity: Activity | void) => {
					if (!activity) {
						return;
					}

					const event = getEventFromActivity(activity, clipboardEvent.eventId);
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

					const start = calendarStore.focusedCell!;
					const end = start.addMinutes(
						minutesBetweenDates(
							event.end,
							event.start
						)
					);

					let updateActivity = Object.assign({}, activity);
					if (CalendarClipboardType.Cut === calendarStore.clipboard!.type) {
						updateActivity = removeEventFromActivity(
							updateActivity,
							clipboardEvent.eventId,
						);
					}

					activityStore.update(
						addEventToActivity(
							updateActivity,
							newEvent(
								start,
								end,
							)
						)
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

	for (const event of calendarStore.focusedEvents) {
		if (!event.id || !event.eventId) {
			continue;
		}
		removeEvent(event.id, event!.eventId);
	}
};

const removeEvent = (activityId: string, eventId: string) => {
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
		activityStore.update(
			removeEventFromActivity(
				activity,
				eventId,
			)
		);
	});
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