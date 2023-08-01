import { LogType } from "@/types/log";

const log = (value: string | Object, type?: LogType) => {
    if (import.meta.env.PROD) return;

    switch (type) {
        case LogType.Info:
            console.info(value);
            break;
        case LogType.Debug:
            console.debug(value);
            break;
        case LogType.Warning:
            console.warn(value);
            break;
        case LogType.Error:
            console.error(value);
            break;
        case LogType.Success:
            console.info(value);
            break;
        default:
            console.log(value);
    };
};

export default log;