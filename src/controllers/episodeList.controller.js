import extractEpisodesList from "../extractors/episodeList.extractor.js";

export const getEpisodes = async (request, params) => {
  try {
    const id = params?.id;

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

    const data = await extractEpisodesList(encodeURIComponent(id));

    return new Response(
      JSON.stringify({
        success: true,
        results: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching episodes:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch episodes",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
