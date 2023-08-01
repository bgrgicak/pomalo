import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { getUtcTimestamp } from '@/helper/date';

const database = new PouchDB(constants.databaseName);
PouchDB.plugin(PouchDBFind);

if (constants.databaseRemotePath) {
  try {
    const remoteDatabase = new PouchDB(constants.databaseRemotePath);
    database.sync(
      remoteDatabase,
      {
        live: true
      }
    ).on('error', (error: any) => {
      log(error, LogType.Error);
    });
  } catch (error: any) {
    log(error.message, LogType.Error);
  }
}

database.createIndex({
  index: {
    fields: ['eventFirstStart', 'eventLastEnd', 'timerRunning'],
    name: 'event-index',
  }
}).then(result => {
  log(result, LogType.Debug);
}).catch(error => {
  log(error, LogType.Error);
});

export default database;

export const newId = (prefix: string): string => {
  return [
    prefix,
    0, // if user isn't logged in, use 0
    getUtcTimestamp() + Math.random(),
  ].join('');
};