if(!self.define){let s,e={};const l=(l,i)=>(l=new URL(l+".js",i).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(i,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let u={};const a=s=>l(s,r),o={module:{uri:r},exports:u,require:a};e[r]=Promise.all(i.map((s=>o[s]||a(s)))).then((s=>(n(...s),u)))}}define(["./workbox-fc255c04"],(function(s){"use strict";self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"android-chrome-192x192.png",revision:"907f08f5107d09616afff4abfeb69df4"},{url:"android-chrome-512x512.png",revision:"2f53ab843e53cc1f6385906d77349358"},{url:"apple-touch-icon.png",revision:"788c84bdd399248ee53ceec3ad1e7a1c"},{url:"assets/ActivityView-57382501.js",revision:null},{url:"assets/ar.es-4173cb29.js",revision:null},{url:"assets/bg.es-3542f853.js",revision:null},{url:"assets/bn.es-55ab5212.js",revision:null},{url:"assets/bs.es-ba9dd541.js",revision:null},{url:"assets/ca.es-3f4af411.js",revision:null},{url:"assets/Calendar-eed83981.css",revision:null},{url:"assets/Calendar.vue_vue_type_style_index_0_lang-60e12d26.js",revision:null},{url:"assets/CalendarView-6c1f4427.js",revision:null},{url:"assets/cs.es-4bf8e61a.js",revision:null},{url:"assets/da.es-084484fb.js",revision:null},{url:"assets/DashboardView-74282144.js",revision:null},{url:"assets/de.es-0185602c.js",revision:null},{url:"assets/drag-and-drop.es-801b9187.js",revision:null},{url:"assets/el.es-b3db55e7.js",revision:null},{url:"assets/en.es-713916b0.js",revision:null},{url:"assets/es.es-2f81ef8f.js",revision:null},{url:"assets/et.es-feab242e.js",revision:null},{url:"assets/fa.es-e30ec481.js",revision:null},{url:"assets/fr.es-fd781cdb.js",revision:null},{url:"assets/he.es-ab017da7.js",revision:null},{url:"assets/hr.es-8ff4208c.js",revision:null},{url:"assets/hu.es-a826dbea.js",revision:null},{url:"assets/id.es-09894c24.js",revision:null},{url:"assets/index-23aba826.css",revision:null},{url:"assets/index-dd25f82f.js",revision:null},{url:"assets/is.es-9608cdad.js",revision:null},{url:"assets/it.es-8f484e02.js",revision:null},{url:"assets/ja.es-b7fc0eb9.js",revision:null},{url:"assets/ka.es-446e6e19.js",revision:null},{url:"assets/ko.es-45e7d699.js",revision:null},{url:"assets/lt.es-bc184482.js",revision:null},{url:"assets/mn.es-5fa17a96.js",revision:null},{url:"assets/nl.es-f5998f61.js",revision:null},{url:"assets/no.es-7a7b8685.js",revision:null},{url:"assets/pl.es-2dc4cbea.js",revision:null},{url:"assets/pt-br.es-82c2bfad.js",revision:null},{url:"assets/ro.es-0b230c59.js",revision:null},{url:"assets/ru.es-3bc3c295.js",revision:null},{url:"assets/SettingsView-c0b8d315.js",revision:null},{url:"assets/SignInView-df057ce0.js",revision:null},{url:"assets/sk.es-477d958c.js",revision:null},{url:"assets/sl.es-7f9e39ca.js",revision:null},{url:"assets/sq.es-484abfbf.js",revision:null},{url:"assets/sr.es-79173882.js",revision:null},{url:"assets/sv.es-cc28424b.js",revision:null},{url:"assets/TaskListView-2d1d03f1.js",revision:null},{url:"assets/TaskListView-dd71112b.css",revision:null},{url:"assets/tr.es-73d31d0a.js",revision:null},{url:"assets/uk.es-72aa5132.js",revision:null},{url:"assets/vi.es-e48f04c7.js",revision:null},{url:"assets/zh-cn.es-d3b0ce92.js",revision:null},{url:"assets/zh-hk.es-f0804a56.js",revision:null},{url:"favicon-16x16.png",revision:"a985d8dae4847f35a0d09a7fe01c38f7"},{url:"favicon-32x32.png",revision:"4ce74ac24ff3e8b59826dc38f998756f"},{url:"favicon.ico",revision:"53b34d3b80a8fe94606f8edb6ed937fa"},{url:"index.html",revision:"76fd93d9e485ad1e45e364bdfafb5784"},{url:"logo.svg",revision:"15fe3bb7dd5765f5298491dff627c2d5"},{url:"mstile-144x144.png",revision:"d4685202087dbc99158e4c7372219362"},{url:"mstile-150x150.png",revision:"bdecbfa9f2bb5d5d1d986a3df249dcbe"},{url:"mstile-310x150.png",revision:"abd990195eb087f04cf7fd20ec7c5677"},{url:"mstile-310x310.png",revision:"0a78c86864768a1d5f2fb5cf6814ce42"},{url:"mstile-70x70.png",revision:"01de374815d5d503d3878e313c053b01"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"safari-pinned-tab.svg",revision:"666b0b6112fd0edd5c541d9cac0f65e8"},{url:"android-chrome-192x192.png",revision:"907f08f5107d09616afff4abfeb69df4"},{url:"android-chrome-512x512.png",revision:"2f53ab843e53cc1f6385906d77349358"},{url:"manifest.webmanifest",revision:"afedcf6682266a0ec8f881978e30e4dd"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
