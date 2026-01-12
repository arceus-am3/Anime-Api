import extractFilterResults from "../extractors/filter.extractor.js";

export const filter = async (request) => {
  try {
    const url = new URL(request.url);
    const sp = url.searchParams;

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

    const keyword = sp.get("keyword");
    const pageNum = parseInt(sp.get("page") || "1", 10);

    const params = {};
    if (type) params.type = type;
    if (status) params.status = status;
    if (rated) params.rated = rated;
    if (score) params.score = score;
    if (season) params.season = season;
    if (language) params.language = language;
    if (genres) params.genres = genres;
    if (sort) params.sort = sort;
    if (sy) params.sy = sy;
    if (sm) params.sm = sm;
    if (sd) params.sd = sd;
    if (ey) params.ey = ey;
    if (em) params.em = em;
    if (ed) params.ed = ed;
    if (keyword) params.keyword = keyword;
    if (pageNum > 1) params.page = pageNum;

    const [totalPage, data, currentPage, hasNextPage] =
      await extractFilterResults(params);

    if (pageNum > totalPage) {
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
        totalPage,
        currentPage,
        hasNextPage,
        results: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in filter controller:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to filter anime",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
