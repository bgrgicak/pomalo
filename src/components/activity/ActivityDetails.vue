<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { ActivityType, type ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import { emptyActivity, openActivityPage } from '@/helper/activities';
import TaskDetails from '../task/TaskDetails.vue';
import TaskSidebar from '../task/TaskSidebar.vue';
import { computed } from 'vue';
import ActivityContent from './ActivityContent.vue';

const props = defineProps(['activity', 'small']);
const state: Ref<ActivityState> = ref({
    activity: props.activity ? (props.activity as Activity) : emptyActivity(ActivityType.New),
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

const isTask = computed(() => {
    return ActivityType.Task === state.value.activity.type;
});
const isNew = computed(() => {
    return ActivityType.New === state.value.activity.type;
});

const onFieldChange = (key: string, value: any) => {
    (state.value.activity as any)[key] = value;
};
</script>
<template>
    <v-card class="activity-details pa-4">
        <v-container>
            <v-row no-gutters>
                <v-col :md="props.small ? '12' : '9'"
                       cols="12">
                    <ActivityContent v-if="!isNew"
                                     :activity="state.activity"
                                     :isEditing="state.isEditing"
                                     @editingChange="(isEditing: boolean) => state.isEditing = isEditing" />
                    <TaskDetails v-if="isTask"
                                 :activity="state.activity"
                                 :small="props.small"
                                 class="mt-6" />
                </v-col>
                <v-col :md="props.small ? '12' : '2'"
                       :offset-md="props.small ? '0' : '1'"
                       cols="12">
                    <TaskSidebar v-if="isTask"
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