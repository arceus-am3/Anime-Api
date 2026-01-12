import extractVoiceActor from "../extractors/actors.extractor.js";

export async function getVoiceActors(request, params) {
  try {
    const id = params.id;

    const voiceActorData = await extractVoiceActor(id);

    // Validate data
    if (
      !voiceActorData ||
      !voiceActorData.results ||
      !voiceActorData.results.data ||
      voiceActorData.results.data.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "No voice actor found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(voiceActorData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
