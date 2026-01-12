import extractAnimeInfo from "../extractors/animeInfo.extractor.js";
import extractSeasons from "../extractors/seasons.extractor.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getAnimeInfo = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      // ❗ res.json mat bhejo, wrapper handle karega
      throw new Error("Anime id is required");
    }

    // Parallel fetch (best practice)
    const [seasons, data] = await Promise.all([
      extractSeasons(id),
      extractAnimeInfo(id),
    ]);

    return {
      data,
      seasons,
    };
  } catch (error) {
    console.error("Error in getAnimeInfo:", error);
    throw new Error("Failed to fetch anime info");
  }
};
