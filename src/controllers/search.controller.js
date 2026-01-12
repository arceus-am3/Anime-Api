import extractSearchResults from "../extractors/search.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const search = async (request) => {
  try {
    const url = new URL(request.url);
    const sp = url.searchParams;

    // original keyword
    const rawKeyword = sp.get("q") || sp.get("keyword");

    if (!rawKeyword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "keyword or q query parameter is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // try converting foreign language
    let keyword = rawKeyword;
    try {
      const converted = await convertForeignLanguage(rawKeyword);
      if (converted && converted.trim().length > 0) {
        keyword = converted;
      }
    } catch {
      // fallback to raw keyword
      keyword = rawKeyword;
    }

    const page = parseInt(sp.get("page") || "1", 10);

    const result = await extractSearchResults({
      keyword,
      type: sp.get("type"),
      status: sp.get("status"),
      rated: sp.get("rated"),
      score: sp.get("score"),
      season: sp.get("season"),
      language: sp.get("language"),
      genres: sp.get("genres"),
      sort: sp.get("sort"),
      page,
      sy: sp.get("sy"),
      sm: sp.get("sm"),
      sd: sp.get("sd"),
      ey: sp.get("ey"),
      em: sp.get("em"),
      ed: sp.get("ed"),
    });

    // normalize extractor result
    let totalPage = 0;
    let data = [];

    if (Array.isArray(result)) {
      totalPage = result[0] ?? 0;
      data = result[1] ?? [];
    } else if (result && typeof result === "object") {
      totalPage =
        result.totalPage ??
        result.totalPages ??
        0;

      data =
        result.data ??
        result.results ??
        [];
    }

    return new Response(
      JSON.stringify({
        success: true,
        keyword,
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
        message: "Search failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
