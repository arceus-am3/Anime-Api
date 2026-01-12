import extractSearchResults from "../extractors/search.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const search = async (request) => {
  try {
    const url = new URL(request.url);
    const sp = url.searchParams;

    let keyword = sp.get("q") || sp.get("keyword");
    const type = sp.get("type");
    const status = sp.get("status");
    const rated = sp.get("rated");
    const score = sp.get("score");
    const season = sp.get("season");
    const language = sp.get("language");
    const genres = sp.get("genres");
    const sort = sp.get("sort");

    const sy = sp.get("sy");
    const sm = sp.get("sm");
    const sd = sp.get("sd");
    const ey = sp.get("ey");
    const em = sp.get("em");
    const ed = sp.get("ed");

    const page = parseInt(sp.get("page") || "1", 10);

    // foreign language safe convert
    if (keyword) {
      keyword = await convertForeignLanguage(keyword);
    }

    // 🔹 CALL EXTRACTOR (DON'T ASSUME SHAPE)
    const result = await extractSearchResults({
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

    /**
     * NORMALIZE RESULT
     * Support all cases:
     * 1) { totalPage, data }
     * 2) [totalPage, data]
     * 3) { page, results }
     * 4) {}
     */
    let totalPage = 0;
    let data = [];

    if (Array.isArray(result)) {
      // old node-style: [totalPage, data]
      totalPage = result[0] ?? 0;
      data = result[1] ?? [];
    } else if (result && typeof result === "object") {
      totalPage =
        result.totalPage ??
        result.totalPages ??
        result.pageCount ??
        0;

      data =
        result.data ??
        result.results ??
        result.items ??
        [];
    }

    if (page > totalPage && totalPage !== 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Requested page exceeds total available pages",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
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
