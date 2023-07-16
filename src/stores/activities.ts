import { defineStore } from "pinia";
import type Activity from "@/types/activity";
import { getAll, add, update, remove } from "@/database/activities";
import { useNoticeStore } from "./notices";
import { NoticeType } from "@/types/notice";
import __ from "@/utilities/translations";
import log from "@/utilities/logs";
import { LogType } from "@/types/log";

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
      getAllActivities(): Activity[] {
        getAll().then((response) => {
          this.activities = response.rows.map(row => row.doc as Activity);
        }).catch((error) => {
          log(error, LogType.Error);
          useNoticeStore().addNotice({
            title: __("Unable to get activities. Please try again."),
            type: NoticeType.Error,
          });
        });
        return this.activities;
      },
      addActivity(activity: Activity) {
        add(activity).then(() => {
          this.activities.push(activity);
        }).catch(error => {
          log(error, LogType.Error);
          useNoticeStore().addNotice({
            title: __("Unable to add activity. Please try again."),
            type: NoticeType.Error,
          });
        });
      },
      updateActivity(activity: Activity) {
        update(activity).catch((error) => {
          log(error, LogType.Error);
          useNoticeStore().addNotice({
            title: __("Unable to update activity. Please try again."),
            type: NoticeType.Error,
          });
        });
      },
      removeActivity(activityId: string) {
        remove(activityId).then(() => {
          const activityIndex = this.activities.findIndex(activity => activity._id === activityId);
          if (activityIndex !== -1) {
            this.activities.splice(activityIndex, 1);
          }
        }).catch(error => {
          log(error, LogType.Error);
          useNoticeStore().addNotice({
            title: __("Unable to remove activity. Please try again."),
            type: NoticeType.Error,
          });
        });
      }
    }
  }
);
