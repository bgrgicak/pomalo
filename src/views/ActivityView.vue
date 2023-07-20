<script setup lang="ts">
import type Activity from '@/types/activity';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { useActivityStore } from '@/stores/activities';

const activityStore = useActivityStore();

const route = useRoute();
const activityId = ref(route.params._id as string);

if (activityId) {
   activityStore.get(activityId.value);
}

watch(() => route.params._id, (newId) => {
   activityId.value = newId as string;
   activityStore.get(activityId.value);
});
</script>
<template>
   <ActivityDetails v-if="activityStore.activities[activityId]"
                    :activity="activityStore.activities[activityId]" />
</template>