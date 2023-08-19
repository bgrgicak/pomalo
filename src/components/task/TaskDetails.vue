<script setup lang="ts">
import type { ActivityEvent } from '@/types/activity';
import __ from '@/helper/translations';
import { computed } from 'vue';
import { toLocaleDateString } from '@/helper/date';
import { getTimePassed } from '@/helper/date';

const props = defineProps(['activity', 'small']);

const events = computed(
    () => {
        const events = props.activity.events
            .filter((event: ActivityEvent) => event.end)
            .map((event: ActivityEvent) => {
                return {
                    date: toLocaleDateString(event.start),
                    duration: getTimePassed(event.start, event.end),
                    type: 'event',
                    icon: 'mdi-timer-outline',
                };
            });
        events.push(
            {
                date: toLocaleDateString(props.activity.created),
                type: 'created',
                icon: 'mdi-pencil-outline'
            }
        );
        if (props.activity.completedDate) {
            events.push(
                {
                    date: toLocaleDateString(props.activity.completedDate),
                    type: 'completed',
                    icon: 'mdi-check'
                }
            );
        }
        return events.sort((a: any, b: any) => a.date < b.date);
    }


);
</script>
<template>
  <v-row v-if="!small">
    <v-col
      cols="12"
      class="event-list"
    >
      <v-timeline
        side="end"
        align="start"
      >
        <v-timeline-item
          v-for="event in events"
          size="small"
          dot-color="transparent"
          :icon="event.icon"
        >
          <template #opposite>
            <v-chip
              v-if="'event' === event.type"
              color="primary"
              small
            >
              {{ __('Worked for ') }}
              {{ event.duration }}{{ __(' hours') }}
            </v-chip>
            <v-chip
              v-if="'completed' === event.type"
              color="success"
              small
            >
              {{ __('Completed ') + props.activity.type }}
            </v-chip>
            <v-chip
              v-else-if="'created' === event.type"
              small
            >
              {{ __('Created ') + props.activity.type }}
            </v-chip>
          </template>
          <strong>
            {{ event.date }}
          </strong>
        </v-timeline-item>
      </v-timeline>
    </v-col>
  </v-row>
</template>