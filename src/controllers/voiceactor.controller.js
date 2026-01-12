import extractVoiceActor from "../extractors/voiceactor.extractor.js";

export async function getVoiceActors(request, params) {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Voice actor id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(request.url);
    const requestedPage = parseInt(url.searchParams.get("page")) || 1;

    const {
      totalPages,
      charactersVoiceActors: data,
    } = await extractVoiceActor(id, requestedPage);

    return new Response(
      JSON.stringify({
        currentPage: requestedPage,
        totalPages,
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch voice actors" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
