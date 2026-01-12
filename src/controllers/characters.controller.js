import extractCharacter from "../extractors/characters.extractor.js";

export async function getCharacter(request, params) {
  try {
    const id = params.id;

    const characterData = await extractCharacter(id);

    // Validate data
    if (
      !characterData ||
      !characterData.results ||
      !characterData.results.data ||
      characterData.results.data.length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Character not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(characterData), {
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
