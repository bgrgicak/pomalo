<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { ActivityType, type ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { openActivityPage } from '@/helper/activities';
import TaskDetails from '../task/TaskDetails.vue';
import TaskSidebar from '../task/TaskSidebar.vue';

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

const save = () => {
    activityStore.update(state.value.activity)
        .then(() => {
            state.value.isEditing = false;
        });
};

const onKeyup = (event: KeyboardEvent) => {
    if ('Meta' === event.key) {
        // Prevent meta enter save from triggering isEditing
        return;
    }
    state.value.isEditing = true;
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.metaKey) {
        save();
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
                            <v-text-field @keyup="onKeyup"
                                          v-model="state.activity.title"
                                          class="activity-title"
                                          variant="underlined" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12"
                               class="pb-0">
                            <v-textarea @keyup="onKeyup"
                                        v-model="state.activity.description"
                                        rows="5"
                                        variant="outlined" />
                        </v-col>
                    </v-row>
                    <v-row v-if="state.isEditing"
                           class="mt-0">
                        <v-col cols="12">
                            <v-btn color="primary"
                                   @click="save">
                                {{ __('Save') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <TaskDetails v-if="ActivityType.Task === state.activity.type"
                                 :activity="state.activity"
                                 :small="props.small"
                                 class="mt-6" />
                </v-col>
                <v-col :md="props.small ? '12' : '2'"
                       :offset-md="props.small ? '0' : '1'"
                       cols="12">
                    <TaskSidebar v-if="ActivityType.Task === state.activity.type"
                                 :activity="state.activity"
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