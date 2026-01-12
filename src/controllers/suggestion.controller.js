import getSuggestion from "../extractors/suggestion.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export async function getSuggestions(request) {
  try {
    const url = new URL(request.url);
    let keyword = url.searchParams.get("keyword");

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: "keyword query parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert foreign language keyword (same logic as original)
    keyword = await convertForeignLanguage(keyword);

    const data = await getSuggestion(encodeURIComponent(keyword));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch suggestions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
