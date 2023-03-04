import constants from '@/utilities/constants';
import PouchDB from 'pouchdb';

const db = new PouchDB(constants.appSlug);

db.info().then((info: Object) => console.log(info));