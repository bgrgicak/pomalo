import { settings } from '@/helper/settings';
import __ from '@/helper/translations';
import { SettingType, type SettingsStructure } from '@/types/setting';

const settingsStructure: SettingsStructure = {
	general: {},
	sync: {
		title: __('Sync'),
		database: {
			title: __('Remote CouchDB credentials'),
			settings: [
				{
					id: 'databaseRemotePath',
					name: __('Remote CouchDB url'),
					type: SettingType.Url,
				},
				{
					id: 'databaseRemoteUsername',
					name: __('Remote CouchDB username'),
					type: SettingType.Text,
				},
				{
					id: 'databaseRemotePassword',
					name: __('Remote CouchDB password'),
					type: SettingType.Password,
				},
			],
		},
		calendar: {
			title: __('Calendar'),
			settings: [
				{
					id: 'calendarSyncInterval',
					name: __('Calendar sync interval'),
					type: SettingType.Number,
					defaultValue: settings.calendar.syncIntervalMinutes,
				},
				{
					id: 'calendarIcalUrls',
					name: __('Calendar iCal urls (one per line)'),
					type: SettingType.Textarea,
				},
			],
		},
	},
	notifications: {
		title: __('Notifications'),
		native: {
			settings: [
				{
					id: 'nativeNoticesEnabled',
					name: __('Allow native notifications'),
					type: SettingType.Boolean,
					defaultValue: true,
				},
			],
		},
	},
};

export default settingsStructure;