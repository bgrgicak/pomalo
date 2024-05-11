export enum NoticeType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success',
};

interface Notice {
	_id?: string;
	title: string;
	type?: NoticeType;
	autoDismiss?: boolean;
	dismissCallback?: (notice: Notice) => void;
	options?: any;
};

export default Notice;