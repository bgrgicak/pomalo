import { LogType } from '@/types/log';
import constants from './constants';

const log = (value: string | Object, type?: LogType, context?: Object) => {
	// if (constants.environment.production) return;

	switch (type) {
	case LogType.Info:
		if (context) {
			console.info(value, context);
		} else {
			console.info(value);
		}
		break;
	case LogType.Debug:
		if (context) {
			console.debug(value, context);
		} else {
			console.debug(value);
		}
		break;
	case LogType.Warning:
		if (context) {
			console.warn(value, context);
		} else {
			console.warn(value);
		}
		break;
	case LogType.Error:
		if (context) {
			console.error(value, context);
		} else {
			console.error(value);
		}
		break;
	case LogType.Success:
		if (context) {
			console.info(value, context);
		} else {
			console.info(value);
		}
		break;
	default:
		if (context) {
			console.log(value, context);
		} else {
			console.log(value);
		}
	};
};

export default log;

export const debug = (value: string | Object, context?: Object) => {
	log(value, LogType.Debug, context);
};

export const info = (value: string | Object, context?: Object) => {
	log(value, LogType.Info, context);
};

export const warning = (value: string | Object, context?: Object) => {
	log(value, LogType.Warning, context);
};

export const error = (value: string | Object, context?: Object) => {
	log(value, LogType.Error, context);
};

export const success = (value: string | Object, context?: Object) => {
	log(value, LogType.Success, context);
};
