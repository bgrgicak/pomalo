import { SettingType, type Setting } from '@/types/setting';

export const addDefaultsToSetting = (setting?: Setting): Setting => {
	return {
		id: '',
		name: '',
		value: '',
		type: SettingType.Text,
		...setting,
	};
};