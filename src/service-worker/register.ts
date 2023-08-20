
import { registerSW } from 'virtual:pwa-register';
import startIcalSync from './ical-sync';

registerSW({
    onRegisteredSW (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
        if (!registration?.active) {
            return;
        }
        startIcalSync();
    },
});
