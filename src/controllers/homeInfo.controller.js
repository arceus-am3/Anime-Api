import getSpotlights from "../extractors/spotlight.extractor.js";
import getTrending from "../extractors/trending.extractor.js";
import extractPage from "../helper/extractPages.helper.js";
import extractTopTen from "../extractors/topten.extractor.js";
import { routeTypes } from "../routes/category.route.js";
import extractSchedule from "../extractors/schedule.extractor.js";

const genres = routeTypes
  .slice(0, 41)
  .map((genre) => genre.replace("genre/", ""));

export const getHomeInfo = async (request) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      spotlights,
      trending,
      topTen,
      schedule,
      topAiring,
      mostPopular,
      mostFavorite,
      latestCompleted,
      latestEpisode,
      topUpcoming,
      recentlyAdded,
    ] = await Promise.all([
      getSpotlights(),
      getTrending(),
      extractTopTen(),
      extractSchedule(today),
      extractPage(1, "top-airing"),
      extractPage(1, "most-popular"),
      extractPage(1, "most-favorite"),
      extractPage(1, "completed"),
      extractPage(1, "recently-updated"),
      extractPage(1, "top-upcoming"),
      extractPage(1, "recently-added"),
    ]);

    // ✅ DENO STYLE RESPONSE
    return new Response(
      JSON.stringify({
        success: true,
        results: {
          spotlights,
          trending,
          topTen,
          today: { schedule },
          topAiring: topAiring?.[0] || [],
          mostPopular: mostPopular?.[0] || [],
          mostFavorite: mostFavorite?.[0] || [],
          latestCompleted: latestCompleted?.[0] || [],
          latestEpisode: latestEpisode?.[0] || [],
          topUpcoming: topUpcoming?.[0] || [],
          recentlyAdded: recentlyAdded?.[0] || [],
          genres,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error fetching home info:", e);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch home info",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
