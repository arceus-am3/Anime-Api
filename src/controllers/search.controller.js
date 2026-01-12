import extractSearchResults from "../extractors/search.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const search = async (request) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    let keyword = params.get("q") || params.get("keyword");
    const type = params.get("type");
    const status = params.get("status");
    const rated = params.get("rated");
    const score = params.get("score");
    const season = params.get("season");
    const language = params.get("language");
    const genres = params.get("genres");
    const sort = params.get("sort");

    const sy = params.get("sy");
    const sm = params.get("sm");
    const sd = params.get("sd");
    const ey = params.get("ey");
    const em = params.get("em");
    const ed = params.get("ed");

    const page = parseInt(params.get("page") || "1", 10);

    if (keyword) {
      keyword = await convertForeignLanguage(keyword);
    }

    // ✅ OBJECT destructuring (NOT array)
    const { totalPage, data } = await extractSearchResults({
      keyword,
      type,
      status,
      rated,
      score,
      season,
      language,
      genres,
      sort,
      page,
      sy,
      sm,
      sd,
      ey,
      em,
      ed,
    });

    if (page > totalPage) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Requested page exceeds total available pages",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        page,
        totalPage,
        results: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in search controller:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Search failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
