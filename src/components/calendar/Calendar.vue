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

const allowedViews = computed(() => {
    return structuredClone(allViews).filter(
        (view: string) => {
            if ('years' === view) {
                return false;
            }
            if (calendarStore.small && 'week' === view) {
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
        return undefined;
    }
    const date = getLocalDate(
        parseInt(
            router.currentRoute.value.query.date as string,
        )
    );
    if (!isValidDate(date)) {
        return undefined;
    }
    return date;
});

const vuecal = computed(() => {
    if (!vuecalRef.value) {
        return undefined;
    }
    return (vuecalRef.value as any).$refs.vuecal;
});

const onKeyboardEvent = (keyboardEvent: any) => {
    maybeCopyPasteEvent(keyboardEvent);
    maybeDeleteEvent(keyboardEvent);
};

const maybeCopyPasteEvent = (keyboardEvent: any) => {
    if ('Escape' === keyboardEvent.key) {
        calendarStore.unfocusEvent();
        layoutStore.hideRightSidebar();
        return;
    }
    if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) {
        return;
    }
    if ('v' === keyboardEvent.key) {
        if (calendarStore.clipboard && calendarStore.focusedCell && isValidDate(calendarStore.focusedCell)) {
            activityStore.get(calendarStore.clipboard.activityId).then((activity: Activity | void) => {
                if (!activity) {
                    return;
                }

                const event = getEventFromActivity(activity, calendarStore.clipboard!.eventId);

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
                updateEvent(
                    activity._id,
                    newEvent(
                        start,
                        end,
                    )
                );
            });
        }
    }

    if (!calendarStore?.focusedEvent?.eventId) {
        return;
    }
    if (!calendarStore?.focusedEvent?.id) {
        return;
    }
    if ('c' === keyboardEvent.key) {
        calendarStore.addToClipboard(calendarStore.focusedEvent!.id, calendarStore.focusedEvent!.eventId, CalendarClipboardType.Copy);
    }
    if ('x' === keyboardEvent.key) {
        calendarStore.addToClipboard(calendarStore.focusedEvent!.id, calendarStore.focusedEvent!.eventId, CalendarClipboardType.Cut);
    }
};

const maybeDeleteEvent = (keyboardEvent: any) => {
    if (!calendarStore?.focusedEvent?.eventId) {
        return;
    }
    if (!calendarStore?.focusedEvent?.id) {
        return;
    }
    if ('Backspace' !== keyboardEvent.key) {
        return;
    }

    removeEvent(calendarStore.focusedEvent.id, calendarStore.focusedEvent!.eventId);
};

const removeEvent = (activityId: string, eventId: string) => {
    activityStore.get(activityId).then((activity: Activity | void) => {
        if (!activity) {
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

const addEvent = (start?: Date) => {
    if (!start) {
        start = getLocalDate();
    }
    const newEventDuration = 60;
    (vuecal.value as any).createEvent(
        start,
        newEventDuration,
        { title: '' }
    );
    layoutStore.showRightSidebar(
        undefined,
        newEvent(
            start,
            start.addMinutes(newEventDuration)
        )
    );
};

const fetch = (start: Date, end: Date) => {
    calendarStore.load(start, end);
    if (start && isValidDate(start) && activeView.value) {
        router.push({
            query: {
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
<style lang="scss">
@mixin event-colors($background, $text) {
    background-color: rgba($background, var(--v-medium-emphasis-opacity));
    color: rgb($text);

    &.vuecal__event--focus {
        background-color: rgba($background, var(--v-high-emphasis-opacity));
    }
}

.vuecal__event {
    @include event-colors(var(--v-theme-primary), var(--v-theme-primary-darken-4));
    border: 1px solid #fff;

    &.vuecal__event--focus {
        box-shadow: 1px 1px 6px rgba(var(--v-border-color), 0.3);
    }

    &.calendar-event__task {
        @include event-colors(var(--v-theme-task), var(--v-theme-task-darken-4));
    }

    &.calendar-event__event {
        @include event-colors(var(--v-theme-event), var(--v-theme-event-darken-4));
    }

    &.calendar-event__project {
        @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
    }

    &.calendar-event__readonly {
        opacity: var(--v-medium-emphasis-opacity);
    }
}

.vuecal__cell--selected,
.vuecal__cell--today,
.vuecal__cell--current {
    background-color: transparent;
}

.vuecal__heading.today {
    font-weight: 600;
}
</style>