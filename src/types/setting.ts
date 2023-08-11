export enum SettingType {
    Text = "text",
    Number = "number",
    Boolean = "boolean",
    Password = "password",
    Url = "url",
};

export interface Setting {
    id: string;
    name: string;
    value?: any;
    type: SettingType;
};

export interface SettingsState {
    settings: {
        [key: string]: any;
    };
};

export interface SettingsSection {
    title?: string;
    settings: Setting[];
}

export interface SettingsGroup {
    title?: string;
    [key: string]: any | SettingsSection;
}

export interface SettingsStructure {
    [key: string]: SettingsGroup;
}