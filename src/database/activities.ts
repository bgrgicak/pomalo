import type Activity from "@/types/activity";
import { ActivityType } from "@/types/activity";
import database from "./pouchdb";

export const find = async (request?: PouchDB.Find.FindRequest<{}> | undefined) => {
    return database.find(request);
};

export const getTasks = async () => {
    return find({
        selector: {
          type: ActivityType.Task
        },
        sort: ['_id'],
      });
};

export const get = async (documentId: string) => {
    return database.get(documentId);
};

export const add = (document: Activity) => {
    return database.put(document);
};

export const update = (updatedDocument: Activity) => {
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