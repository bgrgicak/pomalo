<script setup lang="ts">
import { ref, watch } from 'vue';
import { update } from '@/database/activities';

const props = defineProps(['activity', 'small']);
const state = ref({
    activity: props.activity,
    unsavedChanges: false,
});
watch(() => props.activity, (newActivity) => {
    if (newActivity._id === state.value.activity._id) return;
    state.value.activity = newActivity;
});

const onChange = () => {
    state.value.unsavedChanges = true;
};

const updateActivity = () => {
    update(state.value.activity).then(() => {
        state.value.unsavedChanges = false;
    })
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.metaKey) {
        updateActivity();
    }
};

const updateCompleted = () => {
    const updateActivity = Object.assign({}, props.activity);
    updateActivity.completed = state.value.activity.completed;
    update(updateActivity);
};
</script>
<template>
    <v-card class="activity-details pa-4" @keydown="updateOnCommandEnter">
        <v-container>
            <v-row no-gutters>
                <v-col
                    :md="props.small ? '12' : '9'"
                    sm="12"
                >
                    <v-text-field
                        label="Title"
                        @keyup="onChange"
                        v-model="state.activity.title"
                        class="activity-title"/>
                    <v-row>
                        <v-col cols="12">
                            <v-textarea
                                label="Description"
                                @keyup="onChange"
                                v-model="state.activity.description"
                                rows="5"/>
                        </v-col>
                    </v-row>
                    <v-footer density="compact" class="activity-details__footer" v-if="state.unsavedChanges">
                        <v-spacer/>
                        <v-btn color="primary" @click="updateActivity">Save</v-btn>
                    </v-footer>
                </v-col>
                <v-col
                    :md="props.small ? '12' : '2'"
                    :offset="props.small ? '0' : '1'"
                    sm="12"
                    
                >
                    <v-switch
                        color="success"
                        v-model="state.activity.completed"
                        @change="updateCompleted"
                        label="Completed"
                    />
                </v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<style scoped lang="scss">
@import '@/styles/variables.scss';
.activity-details {
    height: calc(100vh - $header-height);
    position: relative;

    .v-container {
        max-width: 100%;
    }
}
.activity-title {
}
.activity-details__footer {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: $footer-z-index;
    width: 100%;
}
</style>