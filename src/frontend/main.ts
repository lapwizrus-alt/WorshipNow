// ----- WorshipNow (based on FreeShow) -----
// Svelte app entry point

import * as Sentry from "@sentry/electron/renderer"
import "svelte"
import App from "./App.svelte"
import "./components/worshipnow/worshipnow.css"
import { ERROR_FILTER } from "./utils/common"

// error reporting (production only)
// if autoErrorReporting is false, electron reporting will not start and this will fail with an error which is expected
// WorshipNow: error reports must not go to FreeShow's Sentry project. Set up your own DSN to enable this.
const WORSHIPNOW_SENTRY_ENABLED = false
if (import.meta.env.PROD && WORSHIPNOW_SENTRY_ENABLED) {
    Sentry.init({
        dsn: "https://5d1069c3cb6faaa6e7ad0d9dc0145361@o4510419080445952.ingest.us.sentry.io/4510419082346496",
        beforeSend(event) {
            // filter out known non-critical errors
            const errorMessage = event.exception?.values?.[0]?.value || ""
            const shouldFilter = ERROR_FILTER.some((filter) => errorMessage.includes(filter))
            return shouldFilter ? null : event
        }
    })
}

const app = new App({ target: document.body })

export default app
