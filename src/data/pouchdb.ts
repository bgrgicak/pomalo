import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getUtcTimestamp } from '@/helper/date';

const maybeSyncRemote = (database: PouchDB.Database) => {
  if (constants.databaseRemotePath) {
    const remoteDatabase = new PouchDB(constants.databaseRemotePath);
    remoteDatabase.info().then(() => {
      database.sync(
        remoteDatabase,
        {
          live: true
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
      fields: ['eventFirstStart', 'eventLastEnd', 'timerRunning'],
      name: 'event-index',
    }
  });
};

const database = new PouchDB(constants.databaseName);
PouchDB.plugin(PouchDBFind);

database.info().then(() => {
  maybeSyncRemote(database);
  createIndexes(database);
});

export default database;

export const newId = (prefix: string): string => {
  return [
    prefix,
    0, // if user isn't logged in, use 0
    getUtcTimestamp() + Math.random(),
  ].join('');
};