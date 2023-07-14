import { defineStore } from "pinia";
import type Activity from "@/types/activity";
import { getAll, add, update, remove } from "@/database/activities";

interface ActivityState {
  activities: Activity[]
}

export const useActivityStore = defineStore(
  "activities",
  {
    state: (): ActivityState => {
      return {
        activities: [],
      };
    },
    getters: {
      activityCount: (state) => state.activities.length,
    },
    actions: {
      getAllActivities() {
        getAll().then((response) => {
          response.rows.forEach((row) => {
            this.activities.push(row.doc as Activity);
          });
        }).catch((error) => {
          console.log(error);
        });
        return this.activities;
      },
      addActivity(activity: Activity) {
        add(activity).then(() => {
          this.activities.push(activity);
        }).catch(error => {
          console.log(error);
        });
      },
      updateActivity(activity: Activity) {
        update(activity).catch((err) => {
          console.log(err);
        });
      },
      removeActivity(activityId: string) {
        remove(activityId).then(() => {
          const activityIndex = this.activities.findIndex(activity => activity._id === activityId);
          if (activityIndex !== -1) {
            this.activities.splice(activityIndex, 1);
          }
        }).catch(err => {
          console.log(err);
        });
      }
    }
  }
);
