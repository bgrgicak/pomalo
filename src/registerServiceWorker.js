/* eslint-disable no-console */

import { register } from 'register-service-worker'
import { log } from '@/helper/logs';
import { LogType } from "@/types/log";

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB',
        LogType.debug
      )
    },
    registered () {
      log('Service worker has been registered.', LogType.debug)
    },
    cached () {
      log('Content has been cached for offline use.', LogType.debug)
    },
    updatefound () {
      log('New content is downloading.', LogType.debug)
    },
    updated () {
      log('New content is available; please refresh.', LogType.debug)
    },
    offline () {
      log('No internet connection found. App is running in offline mode.', LogType.debug)
    },
    error (error) {
      log(error, LogType.error)
    }
  })
}
