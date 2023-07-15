import constants from '@/configuration/constants';
import PouchDB from 'pouchdb';

const database = new PouchDB(constants.appSlug);

export const getAll = () => {
    return database.allDocs({
        include_docs: true,
        attachments: true,
    });
};

export const add = (document: any) => {
    return database.put(document);
};

export const update = (updatedDocument: any) => {
    return database.get(updatedDocument._id as string).then((document) => {
        return database.put({
            ...updatedDocument,
            _rev: document._rev,
        });
    })
};

export const remove = (documentId: string) => {
    return database.get(documentId).then((document) => {
        return database.remove(document);
    });
};