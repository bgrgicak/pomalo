<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import type { ActivityState } from '@/types/activity';
import type Activity from '@/types/activity';
import { remove, update, updateField, updateCompletedDate } from '@/data/activities';
import __ from '@/helper/translations';
import { openActivityPage } from '@/data/activities';
import router from '@/router/router';
import { useLayoutStore } from '@/stores/layout';
import DatePicker from '@/components/ui/DatePicker.vue';

const props = defineProps(['activity', 'small']);
const state: Ref<ActivityState> = ref({
    activity: props.activity as Activity,
    isEditing: false,
});

const layoutStore = useLayoutStore();

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

const closeActivity = (activity: Activity) => {
    if (!confirm(__('Are you sure you want to close this ') + activity.type + '?')) return;
    remove(activity._id).then(() => {
        layoutStore.hideRightSidebar();
        state.value.isEditing = false;
        router.push('/' + activity.type + 's');
    });
};

const onFieldChange = (key: string, value: any) => {
    updateField(
        state.value.activity._id,
        key,
        value
    ).then((document) => {
        (state.value.activity as any)[key] = value;
    });
};
</script>
<template>
    <v-card class="activity-details pa-4"
            @keydown="updateOnCommandEnter">
        <v-container>
            <v-row no-gutters>
                <v-col :md="props.small ? '12' : '9'"
                       sm="12">
                    <v-text-field :label="__('Title')"
                                  @keyup="onChange"
                                  v-model="state.activity.title"
                                  class="activity-title" />
                    <v-row>
                        <v-col cols="12">
                            <v-textarea :label="__('Description')"
                                        @keyup="onChange"
                                        v-model="state.activity.description"
                                        rows="5" />
                        </v-col>
                    </v-row>
                    <v-footer density="compact"
                              class="activity-details__footer"
                              v-if="state.isEditing">
                        <v-spacer />
                        <v-btn color="primary"
                               @click="updateActivity">
                            {{ __('Save') }}
                        </v-btn>
                    </v-footer>
                </v-col>
                <v-col :md="props.small ? '12' : '2'"
                       :offset="props.small ? '0' : '1'"
                       sm="12">
                    <v-switch color="success"
                              class="pa-4"
                              :model-value="!!state.activity.completedDate"
                              @change="(event: any) => onFieldChange('completedDate', event.target.checked ? new Date() : undefined)"
                              :label="__('Completed')" />
                    <DatePicker :label="__('Due Date')"
                                :value="state.activity.dueDate"
                                @onChange="(value: any) => onFieldChange('dueDate', value)" />
                    <v-divider />
                    <v-btn color="error"
                           class="mt-4"
                           @click="closeActivity(state.activity)"
                           variant="text">
                        {{ __('Close ') + state.activity.type }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.activity-details {
    height: calc(100vh - $header-height);
    position: relative;

    .v-container {
        max-width: 100%;
    }
}

.activity-title {}

.activity-details__footer {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: $footer-z-index;
    width: 100%;
}
</style>