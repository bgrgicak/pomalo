import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router/router';

import vuetify from './plugins/vuetify';

import ganttastic from './plugins/ganttastic';

import './styles/main.scss';
import 'vue-cal/dist/vuecal.css';
import 'medium-editor/dist/css/medium-editor.css';
import 'vuejs-medium-editor/dist/themes/default.css';
// for the code highlighting
import 'highlight.js/styles/github.css';

import '@/service-worker/register';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(ganttastic);

app.mount('#app');