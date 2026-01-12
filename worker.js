import { createApiRoutes } from "./src/routes/apiRoutes.worker.js";

export default {
  async fetch(request, env, ctx) {
    try {
      // ===== CORS =====
      const origin = request.headers.get("Origin") || "*";

      const response = await createApiRoutes(request);

      // CORS headers add
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Methods", "GET");
      headers.set("Access-Control-Allow-Headers", "Content-Type");

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          message: err.message || "Internal Server Error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
