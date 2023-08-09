<script setup lang="ts">
import __ from '@/helper/translations';
import { useCalendarStore } from '@/stores/calendar';

const props = defineProps(['vuecal', 'activeView']);
const emit = defineEmits(['update:activeView', 'addEvent']);


const calendarStore = useCalendarStore();

const previous = () => {
    props.vuecal.previous();
};

const next = () => {
    props.vuecal.next();
};

const today = () => {
    props.vuecal.switchView(props.activeView, new Date());
};


</script>
<template>
    <v-row class="pb-0"
           v-if="props.vuecal">
        <v-col cols="9"
               :md="6"
               :offset-md="3"
               class="d-flex flex-column align-start align-md-center">
            <v-btn-toggle @update:modelValue="(value) => emit('update:activeView', value)"
                          :modelValue="props.activeView"
                          rounded="0"
                          group>
                <v-btn value="year">
                    Year
                </v-btn>
                <v-btn value="month">
                    Month
                </v-btn>
                <v-btn value="week"
                       v-if="!calendarStore.small">
                    Week
                </v-btn>
                <v-btn value="day">
                    Day
                </v-btn>
            </v-btn-toggle>
        </v-col>
        <v-col cols="3"
               class="d-flex flex-column align-end">
            <v-btn icon="mdi-plus"
                   @click="(event: any) => emit('addEvent')"
                   variant="text" />
        </v-col>
    </v-row>
    <v-row class="pb-2">
        <v-col cols="6"
               class="d-flex align-center">
            <h2 class="m-0 text-subtitle-2 text-md-h6">
                {{ (props.vuecal as any)?.viewTitle }}
            </h2>
        </v-col>
        <v-col cols="6"
               class="d-flex align-center">
            <v-spacer />
            <v-btn icon="mdi-arrow-left"
                   @click="previous"
                   variant="text" />
            <v-btn @click="today"
                   icon="mdi-calendar-today"
                   variant="text" />
            <v-btn icon="mdi-arrow-right"
                   @click="next"
                   variant="text" />
        </v-col>
    </v-row>
</template>