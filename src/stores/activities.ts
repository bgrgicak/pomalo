import { defineStore } from 'pinia';
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import log, { debug } from '@/helper/logs';
import { LogType } from '@/types/log';
import database from '@/data/pouchdb';
import { ref, type Ref } from 'vue';
import { addDefaultsToActivity, calculateActivity, parseActivityToDocument, parseDocumentToActivity } from '@/data/activities';
import type { ActivityDocument } from '@/types/activity-document';
import constants from '@/helper/constants';

export interface ActivityMap {
  [key: string]: Activity;
}

export const useActivityStore = defineStore(
  'activities',
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
        activities.value[change.id] = prepareActivityFromDocument(
          change.doc as ActivityDocument
        );
      }
    }).catch((error) => {
      log(error);
    });

    const prepareActivityFromDocument = (activityDocument: ActivityDocument): Activity => {
      return addDefaultsToActivity(
        parseDocumentToActivity(activityDocument)
      );
    };

    const addActivityDocument = (activityDocument: ActivityDocument) => {
      activities.value[activityDocument._id as string] = prepareActivityFromDocument(
        activityDocument
      );
      return activities.value[activityDocument._id as string];
    };

    const find = (request?: PouchDB.Find.FindRequest<{}> | undefined, store: boolean = true): Promise<Activity[] | void> => {
      if (constants.environment.development) {
        (database as any).explain(request).then((result: any) => {
          log(result, LogType.Debug);
        });
      }
      return database.find(request).then((result) => {
        return result.docs as ActivityDocument[];
      }).then((response: ActivityDocument[]) => {
        return response.map(
          (activity: ActivityDocument) =>
            store ? addActivityDocument(activity) : prepareActivityFromDocument(activity)
        );
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };

    const get = (activityId: string): Promise<Activity | void> => {
      if (activities.value[activityId]) {
        return Promise.resolve(activities.value[activityId]);
      }
      return database.get(activityId).then((response) => {
        if (!response) {
          return Promise.reject(__('Activity not found'));
        }
        addActivityDocument(response as ActivityDocument);
        return activities.value[activityId];
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };

    const getPriorityView = (store: boolean = true): Promise<Activity[] | void> => {
      return database.query(
        'priority/type',
        {
          endkey: ['task'],
          startkey: ['task', {}],
          include_docs: true,
          descending: true
        }
      ).then((result) => {
        return result.rows.map(
          (row: any) =>
            store ? addActivityDocument(row.doc) : prepareActivityFromDocument(row.doc)
        );
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };

    // Internal function to put an activity into the database and calculate computed fields
    const put = (activity: Activity) => {
      return database.put(
        parseActivityToDocument(
          calculateActivity(activity)
        )
      );
    };

    const add = (activity: Activity) => {
      const newDocument = Object.assign({}, activity);
      return put(newDocument).catch(error => {
        log(error, LogType.Error);
      });
    };

    const update = (activity: Activity) => {
      const updatedDocument = Object.assign({}, activity);
      return get(updatedDocument._id as string).then((document) => {
        if (!document) {
          return Promise.reject(__('Activity not found'));
        }
        return put({
          ...updatedDocument,
          _rev: document._rev,
        });
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };

    const addOrUpdate = (activity: Activity) => {
      const updatedDocument = Object.assign({}, activity);
      return get(updatedDocument._id as string).then((document) => {
        if (!document) {
          return add(activity);
        }
        if (JSON.stringify(document) === JSON.stringify(updatedDocument)) {
          debug('Activity not changed', activity);
          return Promise.resolve();
        }
        return put({
          ...updatedDocument,
          _rev: document ? document._rev : undefined,
        });
      }).catch((error) => {
        log(error, LogType.Error);
      });
    };

    const updateFields = (activityId: string, fields: Object) => {
      return get(activityId).then((document: any) => {
        const newDocument = Object.assign({}, document);
        Object.keys(fields).forEach((field) => {
          newDocument[field] = (fields as any)[field];
        });
        return put({
          ...newDocument,
          _rev: newDocument._rev,
        }).catch((error) => {
          log(error, LogType.Error);
        });
      });
    };

    const updateField = (activityId: string, field: string, value: any) => {
      return updateFields(
        activityId,
        {
          [field]: value,
        }
      );
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
      getPriorityView,
      add,
      get,
      update,
      addOrUpdate,
      updateField,
      updateFields,
      remove,
    };
  }
);
