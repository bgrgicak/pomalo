import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles/main.sass';
import { createVuetify, type ThemeDefinition } from 'vuetify';
import { computed } from 'vue';
import { VDatePicker } from 'vuetify/labs/VDatePicker';

export const appTheme: ThemeDefinition = {
	dark: false,
	colors: {
		primary: '#30A2FF',
		secondary: '#7ebc2c',
		accent: '#131416',
		success: '#90d338',
		warning: '#d4cb1c',
		error: '#eb2838',
		info: '#2b96da',
		task: '#1069B3',
		event: '#FF854A',
		project: '#FFD317',
		background: '#FFFFFF',
	}
};

const vuetify = createVuetify({
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
		VAutocomplete: {
			rounded: 'sm',
			variant: 'underlined',
		},
	},
	components: {
		VDatePicker,
	},
});


export default vuetify;

export const display = computed(() => vuetify.display);