<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import type { ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { update } from '@/data/activities';
import __ from '@/helper/translations';
import { openActivityPage } from '@/data/activities';
import ActivityClose from './ActivityClose.vue';
import ActivityCompleted from './ActivityCompleted.vue';
import ActivityDueDate from './ActivityDueDate.vue';
import ActivityImportance from './ActivityImportance.vue';

const props = defineProps(['activity', 'small']);
const state: Ref<ActivityState> = ref({
    activity: props.activity as Activity,
    isEditing: false,
});


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

const onChange = () => {
    state.value.isEditing = true;
};

const updateActivity = () => {
    update(state.value.activity).then(() => {
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
                       sm="12">
                    <v-text-field @keyup="onChange"
                                  v-model="state.activity.title"
                                  class="activity-title"
                                  variant="underlined" />
                    <v-row>
                        <v-col cols="12">
                            <v-textarea @keyup="onChange"
                                        v-model="state.activity.description"
                                        rows="5" />
                        </v-col>
                    </v-row>
                    <v-row v-if="state.isEditing">
                        <v-col cols="12">
                            <v-btn color="primary"
                                   @click="updateActivity">
                                {{ __('Save') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col :md="props.small ? '12' : '2'"
                       :offset="props.small ? '0' : '1'"
                       sm="12">
                    <ActivityCompleted :activity="state.activity"
                                       @change="(value: any) => onFieldChange('completedDate', value)" />

                    <ActivityDueDate :activity="state.activity"
                                     @change="(value: any) => onFieldChange('dueDate', value)" />
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
</style>