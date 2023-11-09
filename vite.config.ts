import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vuetify from 'vite-plugin-vuetify';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		vue(),
		vuetify({ styles: { configFile: 'src/styles/vuetify-settings.scss' } }),
		VitePWA({
			injectRegister: 'auto',
			registerType: 'autoUpdate',
			strategies: 'injectManifest',
			injectManifest: { injectionPoint: undefined },
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
				clientsClaim: true,
				skipWaiting: true,
				cleanupOutdatedCaches: true,
			},
			devOptions: {
				enabled: true,
				type: 'module',
			},
			manifest: {
				icons: [
					{
						'src': '/android-chrome-192x192.png',
						'sizes': '192x192',
						'type': 'image/png'
					},
					{
						'src': '/android-chrome-512x512.png',
						'sizes': '512x512',
						'type': 'image/png'
					}
				],
				'theme_color': '#ffffff',
				'background_color': '#ffffff',
				'display': 'standalone',
				'name': 'Pomalo'
			},
			filename: process.env.NODE_ENV === 'production' ? 'sw.ts' : 'sw.js',
			srcDir: process.env.NODE_ENV === 'production' ? 'src/service-worker' : 'public/',
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true
				}) as any,
				NodeModulesPolyfillPlugin()
			]
		}
	},
	build: {
		target: 'esnext',
		outDir: 'public',
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			plugins: [
				// Enable rollup polyfills plugin
				// used during production bundling
				rollupNodePolyFill
			]
		}
	},
	publicDir: 'src/public',
});
