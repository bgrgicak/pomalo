import { defineStore } from 'pinia';
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import log, { debug } from '@/helper/logs';
import { LogType } from '@/types/log';
import database from '@/data/pouchdb';
import { computed, ref, type Ref } from 'vue';
import { addDefaultsToActivity, calculateActivity, parseActivityToDocument, parseDocumentToActivity } from '@/data/activities';
import type { ActivityDocument } from '@/types/activity-document';
import constants from '@/helper/constants';
import { getLocalDate } from '../helper/date';

export interface ActivityMap {
  [key: string]: Activity;
}

export const useActivityStore = defineStore(
	'activities',
	() => {
		let activities: Ref<ActivityMap> = ref({});
		const currentActivityId: Ref<string | undefined> = ref(undefined);

		database.changes({
			since: 'now',
			live: true,
			include_docs: true
		}).on('change', (change) => {
			activities.value[change.id] = prepareActivityFromDocument(
				change.doc as ActivityDocument
			);
		}).catch((error) => {
			log(error);
		});

		const maybeUpdateCurrentActivity = (activityDocument: ActivityDocument): void => {
			if (activityDocument.timerRunning) {
				currentActivityId.value = activityDocument._id;
			} else if (currentActivityId.value && currentActivityId.value === activityDocument._id && !activityDocument.timerRunning) {
				currentActivityId.value = undefined;
			}
		};

		const prepareActivityFromDocument = (activityDocument: ActivityDocument): Activity => {
			maybeUpdateCurrentActivity(activityDocument);
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

		const list = computed((): Activity[] => {
			return Object.values(activities.value);
		});

		const currentActivity = computed((): Activity | undefined => {
			if (!currentActivityId.value) {
				return undefined;
			}
			return activities.value[currentActivityId.value];
		});

		const find = (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[] | void> => {
			if (constants.environment.development) {
				(database as any).explain(request).then((result: any) => {
					log(result, LogType.Debug);
				});
			}
			return database.find(request).then((result) => {
				return result.docs as ActivityDocument[];
			}).then((response: ActivityDocument[]) => {
				return response.map(addActivityDocument);
			}).catch((error) => {
				log(error, LogType.Error);
			});
		};

		const query = (view: string, options: PouchDB.Query.Options<{},{}> | undefined, map?: Function) => {
			return database.query(view, options)
				.then((result) => {
					if (!map) {
						return result.rows;
					}
					return result.rows.map((row: any) => map(row));
				})
				.then((rows) => {
					rows.forEach(
						(row: any) => addActivityDocument(row.doc)
					);
					return rows;
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

		const archive = (activityId: string) => {
			return get(activityId).then((document) => {
				if (!document) {
					return Promise.reject(__('Activity not found'));
				}
				const updatedDocument = Object.assign({}, document);
				updatedDocument.archived = getLocalDate();
				updatedDocument.readonly = true;
				return put({
					...updatedDocument,
					_rev: document._rev,
				}).then(() => {
					delete activities.value[activityId];
				});
			}).catch(error => {
				log(error, LogType.Error);
			});
		};

		const remove = (activityId: string) => {
			return get(activityId).then((document) => {
				if (!document) {
					return Promise.reject(__('Activity not found'));
				}
				return database.remove(document as PouchDB.Core.RemoveDocument).then(() => {
					delete activities.value[activityId];
				});
			}).catch(error => {
				log(error, LogType.Error);
			});
		};

		return {
			activities,
			currentActivity,
			list,
			find,
			query,
			add,
			get,
			update,
			addOrUpdate,
			updateField,
			updateFields,
			archive,
			remove,
		};
	}
);
