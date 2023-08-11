export default {
    appTitle: 'Pomalo',
    appName: 'pomalo',
    databaseName: 'pomalo',
    colors: {
        headerBackground: 'primary-darken-1',
        menuBackground: 'primary',
    },
    icons: {
        logo: 'mdi-palm-tree',
    },
    environment: {
        production: import.meta.env.PROD,
        development: import.meta.env.DEV,
    },
    localStorage: {
        settingsKey: 'pomalo-settings',
    },
};