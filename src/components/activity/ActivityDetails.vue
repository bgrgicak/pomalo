<script setup lang="ts">
import { ActivityType, type ActivityState } from '@/types/activity';
import __ from '@/helper/translations';
import TaskDetails from '../task/TaskDetails.vue';
import TaskSidebar from '../task/TaskSidebar.vue';
import { computed } from 'vue';
import ActivityContent from './ActivityContent.vue';
import ActivityNew from './ActivityNew.vue';
import EventSidebar from '@/components/event/EventSidebar.vue';

const props = defineProps(['activity', 'event', 'small']);

const isNew = computed(() => {
    return undefined === props.activity;
});
const isTask = computed(() => {
    return props.activity && ActivityType.Task === props.activity.type;
});
const isEvent = computed(() => {
    return props.activity && ActivityType.Event === props.activity.type;
});

const onFieldChange = (key: string, value: any) => {
    (props.activity as any)[key] = value;
};
</script>
<template>
    <v-card class="activity-details pa-4">
        <v-container>
            <v-row no-gutters>
                <v-col :md="props.small ? '12' : '8'"
                       cols="12">
                    <ActivityNew v-if="isNew"
                                 :event="props.event"
                                 openInSidebar="true" />
                    <ActivityContent v-else
                                     :activity="props.activity" />
                    <TaskDetails v-if="isTask"
                                 :activity="props.activity"
                                 :small="props.small"
                                 class="mt-6" />
                </v-col>
                <v-col :md="props.small ? '12' : '3'"
                       :offset-md="props.small ? '0' : '1'"
                       cols="12">
                    <TaskSidebar v-if="isTask"
                                 :activity="props.activity"
                                 :small="props.small"
                                 @fieldChange="onFieldChange" />
                    <EventSidebar v-else-if="isEvent"
                                  :activity="props.activity"
                                  :small="props.small"
                                  @fieldChange="onFieldChange" />
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<style lang="scss">
@import '@/assets/styles/variables.scss';

.activity-details {
    position: relative;

    .v-container {
        max-width: 100%;
    }

    .v-text-field.activity-title input {
        font-size: 1.5rem;
        padding-inline-start: 16px;
    }
}

.activity-title {}

.event-item {
    display: flex;

    .v-divider {
        position: relative;
        top: calc(50% - 1px);
    }
}

.event-item__label {
    min-width: 200px;
    text-align: center;
}
</style>