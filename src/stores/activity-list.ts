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
      activities.value = activities.value
        .filter((activity) => updatedActivities[activity._id as string])
        .map((activity) => {
          return updatedActivities[activity._id as string];
        });
    }, { deep: true });

    const find = (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[] | void> => {
      return activityStore.find(request).then((response) => {
        activities.value = response as Activity[];
        return response;
      });
    };

    const add = (activity: Activity) => {
      return activityStore.add(activity).then((response: any) => {
        const newActivity = structuredClone({ ...activity });
        newActivity._id = response.id;
        activities.value.push(newActivity);
        return newActivity;
      });
    };

    return {
      list,
      find,
      add,
    };
  }
);
