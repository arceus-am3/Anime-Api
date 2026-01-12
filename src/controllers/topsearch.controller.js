import extractTopSearch from "../extractors/topsearch.extractor.js";

export async function getTopSearch(request) {
  try {
    const data = await extractTopSearch();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch top search data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
