import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getUtcTimestamp } from '@/helper/date';
import { useSettingsStore } from '@/stores/settings';
import { error } from '@/helper/logs';
// @ts-ignore-next-line
import { priorityView } from './views/priority';

export declare function emit (key: any): void;
export declare function emit (key: any, value: any): void;

export const removeAllIndexes = (database: PouchDB.Database) => {
	database.viewCleanup();
	database.getIndexes().then((indexesResult) => {
		indexesResult.indexes.forEach((index: any) => {
			if (!index.ddoc) {
				return;
			}
			return database.deleteIndex(index);
		});
	}).catch((err) => {
		error(err);
	});
};

const maybeSyncRemote = (database: PouchDB.Database) => {
	const settingsStore = useSettingsStore();
	const path = settingsStore.get('databaseRemotePath');
	const username = settingsStore.get('databaseRemoteUsername');
	const password = settingsStore.get('databaseRemotePassword');
	if (path) {
		const remoteDatabase = new PouchDB(
			path,
			{
				auth: {
					username,
					password,
				}
			}
		);
		remoteDatabase.info().then(() => {
			database.sync(
				remoteDatabase,
				{
					live: true,
					retry: true,
				}
			).on('error', (error: any) => {
				log(error, LogType.Error);
			});
		});
	}
};

const createIndexes = (database: PouchDB.Database) => {
	database.createIndex({
		index: {
			fields: ['_id', 'parent'],
			name: 'activity-id-parent-index',
		},
	});
	database.createIndex({
		index: {
			fields: ['type', 'parent'],
			name: 'activity-type-parent-index',
		},
	});
	database.createIndex({
		index: {
			fields: ['eventFirstStart', 'eventLastEnd', 'timerRunning'],
			name: 'event-index',
		}
	});
};

const createViews = async (database: PouchDB.Database) => {
	const views = [priorityView];
	for (const view of views) {
		const viewId = '_design/' + view.name;
		const viewDocument = await database.get(viewId)
			.catch(err => error(err));
		database.put({
			_id: viewId,
			_rev: viewDocument ? viewDocument._rev : undefined,
			views: {
				...view.views
			},
			stale: 'update_after',
			update_seq: true,
			force: true
		});
	}
};

const database = new PouchDB(constants.databaseName);
PouchDB.plugin(PouchDBFind);

database.info().then(() => {
	maybeSyncRemote(database);
	createIndexes(database);
	createViews(database);
});

export default database;

export const newId = (prefix: string = ''): string => {
	return [
		prefix,
		0, // if user isn't logged in, use 0
		getUtcTimestamp() + Math.random(),
	].join('');
};
