<script setup lang="ts">
import type Activity from '@/types/activity';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { get } from '@/model/activities';

const route = useRoute();
const activity = ref<Activity|null>(null);

const getActivity = (id: string) => {
   get(id).then((response) => {
      activity.value = response as Activity;
   });
};

if (route.params._id) {
   getActivity(route.params._id as string);
}

watch(() => route.params._id, (newId) => {
   getActivity(newId as string);
});
</script>
<template>
    <ActivityDetails v-if="activity"
              :activity="activity"/>
</template>