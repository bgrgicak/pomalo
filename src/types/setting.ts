export enum SettingType {
    Text = 'text',
    Number = 'number',
    Boolean = 'boolean',
    Password = 'password',
    Button = 'button',
    Url = 'url',
    Textarea = 'textarea',
};

export interface Setting {
    id: string;
    name: string;
    label?: string;
    value?: any;
    type: SettingType;
    action?: Function;
    defaultValue?: any;
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