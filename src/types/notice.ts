export enum NoticeType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success'
};

export default interface Notice {
    _id?: string;
    title: string;
    description?: string;
    type?: NoticeType;
};