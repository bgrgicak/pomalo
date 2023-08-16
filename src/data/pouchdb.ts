import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getUtcTimestamp } from '@/helper/date';
import { useSettingsStore } from '@/stores/settings';
import { error } from '@/helper/logs';

export declare function emit (key: any): void;
export declare function emit (key: any, value: any): void;

export const removeAllIndexes = (database: PouchDB.Database) => {
  database.getIndexes().then(function (indexesResult) {
    indexesResult.indexes.forEach(function (index: any) {
      return database.deleteIndex(index);
    });
  }).then(function (result) {
    // handle result
  }).catch(function (err) {
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
      fields: ['priority', 'type'],
      name: 'activity-priority-index',
    },
  });
  database.createIndex({
    index: {
      fields: ['eventFirstStart', 'eventLastEnd', 'timerRunning'],
      name: 'event-index',
    }
  });
};

// const createViews = (database: PouchDB.Database) => {
//   const priority_view = {
//     _id: '_design/priority',
//     views: {
//       by_priority: {
//         map: (function (document: ActivityDocument) {
//           // This doesn't work because CouchDB doesn't have context of calculateActivityPriority...
//           // To fix all conde needs to be inside the map function
//           const priority = calculateActivityPriority(
//             parseDocumentToActivity(document)
//           );
//           emit(
//             [
//               priority,
//               document.type,
//             ],
//           );
//         }).toString()
//       }
//     },
//     stale: 'update_after'
//   };
//   database.put(priority_view);
// };

const database = new PouchDB(constants.databaseName);
PouchDB.plugin(PouchDBFind);

database.info().then(() => {
  maybeSyncRemote(database);
  createIndexes(database);
  // createViews(database);
});

export default database;

export const newId = (prefix: string): string => {
  return [
    prefix,
    0, // if user isn't logged in, use 0
    getUtcTimestamp() + Math.random(),
  ].join('');
};
