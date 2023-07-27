<script setup lang="ts">
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { ref } from 'vue';

const props = defineProps(['activity', 'isEditing']);
const emit = defineEmits(['editingChange']);

const activity = ref(props.activity);

const activityStore = useActivityStore();

const onKeyup = (event: KeyboardEvent) => {
    if ('Meta' === event.key) {
        // Prevent meta enter save from triggering isEditing
        return;
    }
    emit('editingChange', true);
};

const save = () => {
    activityStore.update(activity.value)
        .then(() => {
            emit('editingChange', false);
        });
};

const updateOnCommandEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.metaKey) {
        save();
    }
};
</script>
<template>
    <v-row @keydown="updateOnCommandEnter">
        <v-col cols="12">
            <v-text-field @keyup="onKeyup"
                          v-model="activity.title"
                          class="activity-title"
                          variant="underlined" />
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12"
               class="pb-0">
            <v-textarea @keyup="onKeyup"
                        v-model="activity.description"
                        rows="5"
                        variant="outlined" />
        </v-col>
    </v-row>
    <v-row v-if="props.isEditing"
           class="mt-0">
        <v-col cols="12">
            <v-btn color="primary"
                   @click="save">
                {{ __('Save') }}
            </v-btn>
        </v-col>
    </v-row>
</template>