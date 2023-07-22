import type Activity from "@/types/activity";
import type { ActivityType } from "@/types/activity";
import Router from '@/router/router';
import database from "../helper/pouchdb";

export const find = async (request?: PouchDB.Find.FindRequest<{}> | undefined): Promise<Activity[]> => {
    return database.find(request).then((result) => {
        return result.docs as Activity[];
    });
};

export const get = async (documentId: string): Promise<Activity> => {
    return database.get(documentId);
};

export const add = (document: Activity) => {
    const newDocument = JSON.parse(JSON.stringify(document));
    newDocument._id = newDocument._id || newDocument.title.toLowerCase().replace(/ /g, '-');
    return database.put(newDocument);
};

export const update = (document: Activity) => {
    const updatedDocument = JSON.parse(JSON.stringify(document));
    return database.get(updatedDocument._id as string).then((document) => {
        return database.put({
            ...updatedDocument,
            _rev: document._rev,
        });
    });
};

export const updateField = (documentId: string, key: string, value: any) => {
    return get(documentId).then((document: any) => {
        const newDocument = JSON.parse(JSON.stringify(document));
        newDocument[key] = value;
        console.log(newDocument);
        return database.put({
            ...newDocument,
            _rev: newDocument._rev,
        });
    });
};

export const remove = (documentId: string) => {
    return get(documentId).then((document) => {
        return database.remove(document as any);
    });
};

export const emptyActivity = (type: ActivityType): Activity => {
    return {
        _id: '',
        title: '',
        type,
        created: new Date(),
    };
};

export const openActivityPage = async (activity: Activity) => {
    return Router.push(`/${activity.type}/${activity._id}/`);
};

export const updateCompletedDate = (activity: Activity): Activity => {
    const updateActivity = Object.assign({}, activity) as Activity;
    updateActivity.completedDate = updateActivity.completedDate ? undefined : new Date();
    return updateActivity;
};