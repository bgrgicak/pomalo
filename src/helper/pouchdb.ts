import constants from '@/helper/constants';
import { LogType } from '@/types/log';
import log from '@/helper/logs';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

const database = new PouchDB(constants.appSlug);
PouchDB.plugin(PouchDBFind);

// PouchDB.replicate(constants.appSlug, 'http://localhost:5984/' + constants.appSlug, { live: true });

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
    fields: ['events[].start', 'events[].end'],
    name: 'events-index',
  }
}).then(result => {
  log(result, LogType.Debug);
}).catch(error => {
  log(error, LogType.Error);
});

export default database;