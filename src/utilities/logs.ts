import { LogType } from "@/types/log";

const log = (value: string, type: LogType) => {
    if (import.meta.env.PROD) return;

    switch (type) {
        case LogType.Info:
            console.info(`%c${value}`, 'color: #0000ff');
            break;
        case LogType.Debug:
            console.log(`%c${value}`, 'color: #00ff00');
            break;
        case LogType.Warning:
            console.warn(`%c${value}`, 'color: #ffff00');
            break;
        case LogType.Error:
            console.error(`%c${value}`, 'color: #ff0000');
            break;
        case LogType.Success:
            console.info(`%c${value}`, 'color: #00ffff');
            break;
        default:
            console.log(`%c${value}`, 'color: #000000');
    };
};

export default log;