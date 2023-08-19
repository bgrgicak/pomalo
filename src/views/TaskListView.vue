<script setup lang="ts">
import { ActivityType } from "@/types/activity";
import ActivityList from "../components/activity/ActivityList.vue";
</script>

<template>
  <main>
    <ActivityList :type="ActivityType.Task" />
  </main>
</template>
