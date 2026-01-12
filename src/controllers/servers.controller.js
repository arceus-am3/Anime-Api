import { extractServers } from "../extractors/streamInfo.extractor.js";

export const getServers = async (request) => {
  try {
    const url = new URL(request.url);
    const ep = url.searchParams.get("ep");

    if (!ep) {
      return new Response(
        JSON.stringify({ error: "ep query parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const servers = await extractServers(ep);

    return new Response(
      JSON.stringify({
        success: true,
        results: servers,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching servers:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch servers",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
