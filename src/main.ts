import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router/router";

import vuetify from "./plugins/vuetify";

import "./styles/main.scss";

import 'vue-cal/dist/vuecal.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount("#app");
