import { createApiRoutes } from "./src/routes/apiRoutes.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // fake app object (Express adapter)
      const app = {
        routes: [],
        get(path, handler) {
          this.routes.push({ method: "GET", path, handler });
        },
      };

      const jsonResponse = (_, data) => json({ success: true, results: data });
      const jsonError = (_, message, status = 500) =>
        json({ success: false, message }, status);

      // register routes
      createApiRoutes(app, jsonResponse, jsonError);

      // match route
      for (const route of app.routes) {
        if (
          route.method === "GET" &&
          url.pathname === route.path
        ) {
          return await route.handler(
            { url: request.url },
            {}
          );
        }
      }

      return json({ success: false, message: "Route not found" }, 404);
    } catch (e) {
      return json({ success: false, message: e.message }, 500);
    }
  },
};
