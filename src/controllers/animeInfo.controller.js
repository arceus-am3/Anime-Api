import extractAnimeInfo from "../extractors/animeInfo.extractor.js";
import extractSeasons from "../extractors/seasons.extractor.js";

export const getAnimeInfo = async (request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Anime id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [seasons, data] = await Promise.all([
      extractSeasons(id),
      extractAnimeInfo(id),
    ]);

    // ❗ EXACT SAME AS DENO
    return new Response(
      JSON.stringify({
        data,
        seasons,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("getAnimeInfo error:", e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch anime info" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
