# Pomalo

Time management app based around a calendar interface.

[A demo is available here.](https://pomalo.bluebanana.hr/)

The app lives in the browser and is designed to be used as a PWA. There is no cloud storage, all data is stored locally in the browser and stays private.
You can connect it to a CouchDB server for syncing between devices.

If you like the project, please consider contributing. The project is in early stages and there is a lot of work to be done.

## Features

This is a work in progress, but the following features are planned:

- [x] Calendar view
- [x] Task list
- [x] Project list
- [x] Timer
- [x] Ical import
- [x] CouchDB sync
- [ ] Metrics
- [ ] Offline support
- [ ] All event fields
- [ ] WSYWIG editor
- [ ] Automated task scheduling

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

Install [Node.js and npm.](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)


```sh
npm run setup
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Local Pouch server for development

Install by following the [PouchDB Server](https://pouchdb.com/guides/setup-couchdb.html) instructions.

Run with:

```pouchdb-server --port 5984```

## Run production build with Docker

```sh
npm run build
docker-compose up -d
```

You can now access the app at http://localhost:6982

### Stop production build with Docker

```sh
docker-compose down
```