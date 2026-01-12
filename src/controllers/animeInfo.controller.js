import extractAnimeInfo from "../extractors/animeInfo.extractor.js";
import extractSeasons from "../extractors/seasons.extractor.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getAnimeInfo = async (request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Anime id is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parallel fetch
    const [seasons, data] = await Promise.all([
      extractSeasons(id),
      extractAnimeInfo(id),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        seasons,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in getAnimeInfo:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch anime info",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
