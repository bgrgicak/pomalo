<script setup lang="ts">
import { get } from '@/database/activities';
import type Activity from '@/types/activity';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ActivityDetails from '@/components/activity-details/ActivityDetails.vue';

const router = useRouter();
const { _id } = router.currentRoute.value.params;
const activity = ref<Activity|null>(null);

if(_id) {
   get(_id as string).then((response) => {
      activity.value = response as Activity;
      console.log(activity.value);
   });
}
</script>
<template>
    <ActivityDetails v-if="activity"
              :activity="activity"/>
</template>