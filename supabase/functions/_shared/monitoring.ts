
import * as Sentry from "https://esm.sh/@sentry/deno@8.0.0";

/**
 * Initializes Sentry for the Edge Function
 */
export function initMonitoring() {
  const dsn = Deno.env.get("SENTRY_DSN");
  const environment = Deno.env.get("PLAID_ENV") || "development";

  if (dsn) {
    Sentry.init({
      dsn,
      environment,
      // Performance monitoring
      tracesSampleRate: 1.0,
    });
    return true;
  }
  return false;
}

/**
 * Wrapper for Edge Function handlers to provide Sentry monitoring
 */
export function withMonitoredHandler(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const isSentryInitialized = initMonitoring();

    try {
      return await handler(req);
    } catch (error) {
      console.error("[Monitoring] Captured error:", error);

      if (isSentryInitialized) {
        Sentry.captureException(error);
        // Ensure the event is sent before the function terminates
        await Sentry.flush(2000);
      }

      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}
