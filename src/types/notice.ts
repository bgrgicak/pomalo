export enum NoticeType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success',
};

interface Notice {
    _id?: string,
    title: string,
    description?: string,
    type?: NoticeType,
};

export default Notice;