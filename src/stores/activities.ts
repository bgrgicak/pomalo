import { defineStore } from "pinia";
import type Activity from "@/types/activity";
import {
  find as dataFind,
  add as dataAdd,
  get as dataGet,
  update as dataUpdate,
  remove as dataRemove,
} from "@/data/activities";
import __ from "@/helper/translations";
import log from "@/helper/logs";
import { LogType } from "@/types/log";
import database from "@/helper/pouchdb";
import { computed, ref, type Ref } from "vue";

interface ActivityMap {
  [key: string]: Activity;
}

export const mapActivities = (activities: Activity[]): ActivityMap => {
  const activityMap: ActivityMap = {};
  activities.forEach((activity: Activity) => {
    activityMap[activity._id as string] = activity;
  });
  return activityMap;
};

export const useActivityStore = defineStore(
  "activities",
  () => {
    let activities: Ref<ActivityMap> = ref({});

    database.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', (change) => {
      if (change.deleted && activities.value[change.id]) {
        delete activities.value[change.id];
      } else {
        activities.value[change.id] = change.doc as Activity;
      }
    }).catch((error) => {
      log(error);
    });

    const list = computed((): Activity[] => {
      return Object.values(activities.value);
    });

    const find = (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[] | void> => {
      return dataFind(request).then((response: Activity[]) => {
        activities.value = mapActivities(response);
        return list.value;
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const get = (activityId: string): Promise<Activity | void> => {
      if (activities.value[activityId]) {
        return Promise.resolve(activities.value[activityId]);
      }
      return dataGet(activityId).then((response: Activity) => {
        activities.value[activityId] = response;
        return response;
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const add = (activity: Activity) => {
      return dataAdd(activity).catch(error => {
        log(error, LogType.Error);
      });
    };
    const update = (activity: Activity) => {
      return dataUpdate(activity).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const remove = (activityId: string) => {
      return dataRemove(activityId).catch(error => {
        log(error, LogType.Error);
      });
    };

    return {
      activities,
      list,
      find,
      add,
      get,
      update,
      remove,
    };
  }
);
