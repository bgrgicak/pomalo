<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps(['activity']);
const activity = ref(props.activity);
watch(() => props.activity, (newActivity) => {
    if (newActivity._id === activity.value._id) return;
    activity.value = newActivity;
});
</script>
<template>
    <v-card class="activity-details">
        <v-card-title>
            <v-icon>mdi-calendar</v-icon>
            <span>{{ activity.title }}</span>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-text-field label="Title"
                                v-model="activity.title"/>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<style scoped lang="scss">
.activity-details {
    height: 100%;
}
</style>