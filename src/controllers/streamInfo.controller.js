import { extractStreamingInfo } from "../extractors/streamInfo.extractor.js";

export const getStreamInfo = async (request, fallback = false) => {
  try {
    const url = new URL(request.url);

    const input = url.searchParams.get("id");
    const server = url.searchParams.get("server");
    const type = url.searchParams.get("type");

    if (!input) {
      return new Response(
        JSON.stringify({ error: "id query parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // input example: ?id=some-slug?ep=12
    const match = input.match(/ep=(\d+)/);
    if (!match) {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const finalId = match[1];

    const streamingInfo = await extractStreamingInfo(
      finalId,
      server,
      type,
      fallback
    );

    return new Response(
      JSON.stringify({
        success: true,
        results: streamingInfo,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getStreamInfo:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to fetch stream info",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
