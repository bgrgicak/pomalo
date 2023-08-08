<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ActivityMain from '@/components/activity/ActivityMain.vue';
import { useActivityStore } from '@/stores/activities';

const activityStore = useActivityStore();

const route = useRoute();
const activityId = ref(route.params._id as string);

if (activityId.value) {
   activityStore.get(activityId.value);
}

watch(() => route.params._id, (newId) => {
   activityId.value = newId as string;
   if (activityId.value) {
      activityStore.get(activityId.value);
   }
});
</script>
<template>
   <ActivityMain v-if="activityStore.activities[activityId]"
                 :activity="activityStore.activities[activityId]" />
</template>