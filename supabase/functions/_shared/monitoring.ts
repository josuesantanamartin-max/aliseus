import * as Sentry from "https://esm.sh/@sentry/deno@8.0.0";
import { corsHeaders } from "./cors.ts";

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
        await Sentry.flush(2000);
      }

      // Intentar extraer un mensaje útil del error
      const errorMessage = error.response?.data?.error_message || 
                          error.message || 
                          "Internal Server Error";

      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: errorMessage,
          details: error.response?.data || null,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  };
}
