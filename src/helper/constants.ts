export default {
    appTitle: 'Pomalo',
    appName: 'pomalo',
    databaseName: 'pomalo',
    databaseRemotePath: 'http://localhost:5984/pomalo',
    colors: {
        'icons': 'blue-grey-darken-4',
    },
    icons: {
        logo: 'mdi-palm-tree',
    },
    environment: {
        production: import.meta.env.PROD,
        development: import.meta.env.DEV,
    },
};