import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles/main.sass';
import { createVuetify, type ThemeDefinition } from 'vuetify';


const appTheme: ThemeDefinition = {
    dark: false,
    colors: {
        primary: '#30A2FF',
        secondary: '#7ebc2c',
        accent: '#131416',
        success: '#90d338',
        warning: '#d4cb1c',
        error: '#eb2838',
        info: '#2b96da',
        task: '#36bc2c',
        event: '#bc2c7e',
        project: '#bcb22c',
    }
};

export default createVuetify({
    theme: {
        defaultTheme: 'appTheme',
        variations: {
            colors: ['primary', 'secondary', 'task', 'event', 'project'],
            lighten: 3,
            darken: 4,
        },
        themes: {
            appTheme,
        },
    },
    defaults: {
        VBtn: {
            rounded: 'sm',
            variant: 'outlined',
        },
        VTextField: { variant: 'underlined' },
        VSelect: { variant: 'underlined' },
        VAlert: {
            rounded: 'sm',
            variant: 'outlined'
        },
    },
});