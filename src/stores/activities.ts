import { defineStore } from "pinia";
import type Activity from "@/types/activity";
import __ from "@/helper/translations";
import log from "@/helper/logs";
import { LogType } from "@/types/log";
import database from "@/helper/pouchdb";
import { computed, ref, type Ref } from "vue";
import { addDefaultsToActivity } from "@/helper/activities";

export interface ActivityMap {
  [key: string]: Activity;
}

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

    const find = (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[] | void> => {
      return database.find(request).then((result) => {
        return result.docs as Activity[];
      }).then((response: Activity[]) => {
        response.forEach((activity: Activity) => {
          activities.value[activity._id as string] = addDefaultsToActivity(activity);
        });
        return response;
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const get = (activityId: string): Promise<Activity | void> => {
      if (activities.value[activityId]) {
        return Promise.resolve(activities.value[activityId]);
      }
      return database.get(activityId).then((response) => {
        activities.value[activityId] = addDefaultsToActivity(response as Activity);
        return activities.value[activityId];
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const add = (activity: Activity) => {
      const newDocument = Object.assign({}, activity);
      return database.put(newDocument).catch(error => {
        log(error, LogType.Error);
      });
    };
    const update = (activity: Activity) => {
      const updatedDocument = Object.assign({}, activity);
      return database.get(updatedDocument._id as string).then((document) => {
        return database.put({
          ...updatedDocument,
          _rev: document._rev,
        });
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };
    const updateField = (activityId: string, field: string, value: any) => {
      return get(activityId).then((document: any) => {
        const newDocument = Object.assign({}, document);
        newDocument[field] = value;
        return database.put({
          ...newDocument,
          _rev: newDocument._rev,
        }).catch((error) => {
          log(error, LogType.Error);
        });
      });
    };
    const remove = (activityId: string) => {
      return get(activityId).then((document) => {
        return database.remove(document as any);
      }).catch(error => {
        log(error, LogType.Error);
      });
    };

    return {
      activities,
      find,
      add,
      get,
      update,
      updateField,
      remove,
    };
  }
);
