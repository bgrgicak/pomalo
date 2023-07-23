import { defineStore } from "pinia";
import type Activity from "@/types/activity";
import { computed, ref, watch, type Ref } from "vue";
import { useActivityStore, type ActivityMap } from "./activities";

export const useActivityListStore = defineStore(
  "activity-list",
  () => {
    const activities: Ref<Activity[]> = ref([]);

    const activityStore = useActivityStore();

    const list = computed((): Activity[] => {
      return activities.value;
    });

    watch(() => activityStore.activities, (updatedActivities: ActivityMap) => {
      activities.value = activities.value.map((activity) => {
        return updatedActivities[activity._id as string];
      });
    }, { deep: true });

    const find = (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[] | void> => {
      return activityStore.find(request).then((response) => {
        activities.value = response as Activity[];
        return response;
      });
    };

    return {
      list,
      find
    };
  }
);
