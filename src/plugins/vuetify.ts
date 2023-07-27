import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles/main.sass';


export default createVuetify({
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#2196f3',
                    secondary: '#03a9f4',
                    accent: '#3f51b5',
                    error: '#ff5722',
                    warning: '#ff9800',
                    info: '#607d8b',
                    success: '#4caf50'
                }
            },
        },
    },
});