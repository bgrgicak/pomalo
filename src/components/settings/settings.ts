import __ from "@/helper/translations";
import { SettingType, type SettingsStructure } from "@/types/setting";

const settingsStructure: SettingsStructure = {
    general: {

    },
    sync: {
        title: __('Sync'),
        database: {
            title: __('Remote CouchDB credentials'),
            settings: [
                {
                    'id': 'databaseRemotePath',
                    'name': __('Remote CouchDB url'),
                    'type': SettingType.Url,
                },
                {
                    'id': 'databaseRemoteUsername',
                    'name': __('Remote CouchDB username'),
                    'type': SettingType.Text,
                },
                {
                    'id': 'databaseRemotePassword',
                    'name': __('Remote CouchDB password'),
                    'type': SettingType.Password,
                },
            ]
        }
    }
};

export default settingsStructure;