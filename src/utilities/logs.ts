export enum LogType {
    Info = 'info',
    Debug = 'debug',
    Warning = 'warning',
    Error = 'error',
    Success = 'success'
};

const log = (value: string, type: LogType) => {
    console.log(value);
};

export default log;