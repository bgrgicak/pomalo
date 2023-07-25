<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import type { ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { openActivityPage } from '@/helper/activities';
import ActivityClose from './ActivityClose.vue';
import ActivityCompleted from './ActivityCompleted.vue';
import ActivityDueDate from './ActivityDueDate.vue';
import ActivityImportance from './ActivityImportance.vue';
import ActivityEstimatedTime from './ActivityEstimatedTime.vue';
import ActivityTimer from './ActivityTimer.vue';
import constants from '@/helper/constants';
import { computed } from 'vue';
import { toLocaleDateString } from '@/helper/date';
import { getTimePassed } from '@/helper/date';

const props = defineProps(['activity', 'small']);
const state: Ref<ActivityState> = ref({
    activity: props.activity as Activity,
    isEditing: false,
});

const activityStore = useActivityStore();

watch(() => props.activity, (newActivity) => {
    if (newActivity._id === state.value.activity._id) return;
    if (state.value.isEditing) {
        if (!confirm(__('You have unsaved changes. Are you sure you want to continue?'))) {
            openActivityPage(state.value.activity);
            return;
        }
    }
    state.value.activity = Object.assign({}, newActivity);
    state.value.isEditing = false;
});

const events = computed(
    () => state.value.activity.events
        .filter((event) => event.end)
        .sort((a, b) => a.start - b.start)
        .map((event) => {
            const date = (event.start);
            return {
                date: toLocaleDateString(date),
                duration: getTimePassed(event.start, event.end)
            };
        })
);

const onChange = () => {
    state.value.isEditing = true;
};

const updateActivity = () => {
    activityStore.update(state.value.activity).then(() => {
        state.value.isEditing = false;
    });
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.metaKey) {
        updateActivity();
    }
};

const onFieldChange = (key: string, value: any) => {
    (state.value.activity as any)[key] = value;
};
</script>
<template>
    <v-card class="activity-details pa-4"
            @keydown="updateOnCommandEnter">
        <v-container>
            <v-row no-gutters>
                <v-col :md="props.small ? '12' : '9'"
                       cols="12">

                    <v-row>
                        <v-col cols="12">
                            <v-text-field @keyup="onChange"
                                          v-model="state.activity.title"
                                          class="activity-title"
                                          variant="underlined" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-textarea @keyup="onChange"
                                        v-model="state.activity.description"
                                        rows="5"
                                        variant="outlined" />
                        </v-col>
                    </v-row>
                    <v-row v-if="state.isEditing">
                        <v-col cols="12">
                            <v-btn :color="constants.colors.primary"
                                   @click="updateActivity">
                                {{ __('Save') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="!small">
                        <v-col cols="12"
                               class="event-list">
                            <h2 align="center">
                                {{ __('Activity log') }}
                            </h2>
                            <v-timeline side="end"
                                        align="start">
                                <v-timeline-item v-for="event in events"
                                                 size="small"
                                                 dot-color="transparent"
                                                 icon="mdi-timer-outline">

                                    <template v-slot:opposite>
                                        <v-chip :color="constants.colors.primary"
                                                small>
                                            {{ __('Worked for ') }}
                                            {{ event.duration }}{{ __(' hours') }}
                                        </v-chip>
                                    </template>
                                    <strong>
                                        {{ event.date }}
                                    </strong>
                                </v-timeline-item>
                            </v-timeline>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col :md="props.small ? '12' : '2'"
                       :offset-md="props.small ? '0' : '1'"
                       cols="12">
                    <ActivityTimer :activity="state.activity" />
                    <ActivityCompleted :activity="state.activity"
                                       @change="(value: any) => onFieldChange('completedDate', value)" />
                    <v-divider />
                    <ActivityDueDate :activity="state.activity"
                                     @change="(value: any) => onFieldChange('dueDate', value)" />
                    <ActivityEstimatedTime :activity="state.activity"
                                           @change="(value: any) => onFieldChange('estimatedTime', value)" />
                    <ActivityImportance :activity="state.activity"
                                        @change="(value: any) => onFieldChange('importance', value)" />
                    <v-divider />
                    <ActivityClose :activity="state.activity"
                                   class=" mt-4" />
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<style lang="scss">
@import '@/assets/styles/variables.scss';

.activity-details {
    height: calc(100vh - $header-height);
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