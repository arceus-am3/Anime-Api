import extractEpisodesList from "../extractors/episodeList.extractor.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export const getEpisodes = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("Anime id is required");
    }

    const data = await extractEpisodesList(encodeURIComponent(id));

    return data;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    throw new Error("Failed to fetch episodes");
  }
};
