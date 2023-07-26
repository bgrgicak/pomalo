import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

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
    fields: ['title'],
    name: 'search-index',
  }
}).then(result => {
  log(result, LogType.Debug);
}).catch(error => {
  log(error, LogType.Error);
});

database.createIndex({
  index: {
    fields: ['type'],
    name: 'type-index',
  }
}).then(result => {
  log(result, LogType.Debug);
}).catch(error => {
  log(error, LogType.Error);
});

database.createIndex({
  index: {
    fields: ['events.start', 'events.end'],
    name: 'events-index',
  }
}).then(result => {
  log(result, LogType.Debug);
}).catch(error => {
  log(error, LogType.Error);
});

export default database;