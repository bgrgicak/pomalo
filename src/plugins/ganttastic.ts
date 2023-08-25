
import ganttastic from '@infectoone/vue-ganttastic';
import { appTheme } from '@/plugins/vuetify';

export const colorScheme = {
	primary: appTheme.colors!.background,
	secondary: appTheme.colors!.background,
	ternary: appTheme.colors!.background,
	quartenary: appTheme.colors!.background,
	hoverHighlight: appTheme.colors!.background,
	text: 'rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))',
	background: appTheme.colors!.background,
};

export default ganttastic;