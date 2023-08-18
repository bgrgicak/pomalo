const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;
sw.addEventListener('sync', (event) => { });
