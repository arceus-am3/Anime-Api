import extractWatchlist from "../extractors/watchlist.extractor.js";

export async function getWatchlist(request, params) {
  try {
    const userId = params.userId;
    const page = parseInt(params.page) || 1;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { watchlist, totalPages } = await extractWatchlist(userId, page);

    const responseData = {
      success: true,
      results: {
        totalPages,
        data: watchlist.map((item) => ({
          id: item.id,
          data_id: item.data_id,
          poster: item.poster,
          title: item.title,
          japanese_title: item.japanese_title,
          description: item.description,
          tvInfo: {
            showType: item.tvInfo.showType,
            duration: item.tvInfo.duration,
            sub: item.tvInfo.sub,
            dub: item.tvInfo.dub,
            ...(item.tvInfo.eps && { eps: item.tvInfo.eps }),
          },
          adultContent: item.adultContent,
        })),
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error getting watchlist:", e);

    return new Response(
      JSON.stringify({
        error: "An error occurred while fetching the watchlist.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
