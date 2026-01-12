import extractNextEpisodeSchedule from "../extractors/getNextEpisodeSchedule.extractor.js";

export async function getNextEpisodeSchedule(request, params) {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Anime id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const nextEpisodeSchedule = await extractNextEpisodeSchedule(id);

    return new Response(
      JSON.stringify({ nextEpisodeSchedule }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch next episode schedule" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
