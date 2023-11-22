<script lang="ts" setup>
import { computed } from 'vue';
import { useCalendarStore } from '../../stores/calendar';
import { getLocalDate, getWeekStartAndEnd, toTimeString } from '../../helper/date';
import { ActivityType } from '../../types/activity';
import __ from '../../helper/translations';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const calendarStore = useCalendarStore();

const {start, end} = getWeekStartAndEnd(
	getLocalDate()
);

const events: any = computed(() => {
	const eventData: any = {};
	calendarStore.events.filter((event) => {
		return event.type === ActivityType.Task || event.type === ActivityType.Project;
	}).forEach((event) => {
		if (!event.id) {
			return;
		}
		if ( ! eventData[event.id] ) {
			eventData[event.id] = {
				totalTime: 0,
				title: event.title,
				type: event.type,
				id: event.id,
			};
		}
		if (event.end && event.start) {
			eventData[event.id].totalTime += (event.end.getTime() - event.start.getTime());
		}
	});
	return Object.values(eventData).sort((a: any, b: any) => {
		return b.totalTime - a.totalTime;
	});
});

const totalTime = computed(() => {
	return events.value.reduce((total: number, event: any) => {
		return total + event.totalTime;
	}, 0);
});

const chartData = computed(() => {
	return {
		labels: events.value.map((event: any) => {
			return event.title;
		}),
		datasets: [
			{
				labels: events.value.map((event: any) => {
					return event.title;
				}),
				data: events.value.map((event: any) => {
					return event.totalTime;
				}),
			},
		],
	};
});

calendarStore.load(start, end);
</script>
<template>
  <v-card
    class="calendar pa-4"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <Pie :data="chartData" />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-card-title>
          {{ __('Total time spent: ') + toTimeString(totalTime) }}
        </v-card-title>
        <v-table v-if="events.length > 0">
          <thead>
            <tr>
              <th class="text-left">
                {{ __('Title') }}
              </th>
              <th class="text-left">
                {{ __('Time') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in events"
              :key="event.id"
            >
              <td>
                {{ event.title }}
              </td>
              <td>
                {{ toTimeString(event.totalTime) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-card>
</template>