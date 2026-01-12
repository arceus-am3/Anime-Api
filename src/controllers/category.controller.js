import { extractor } from "../extractors/category.extractor.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export async function getCategory(request, routeType) {
  try {
    // Fix typo (same logic as original)
    if (routeType === "genre/martial-arts") {
      routeType = "genre/marial-arts";
    }

    const url = new URL(request.url);
    const requestedPage = parseInt(url.searchParams.get("page")) || 1;

    // const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;

    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return new Response(JSON.stringify(cachedResponse), {
    //     status: 200,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    const { data, totalPages } = await extractor(routeType, requestedPage);

    if (requestedPage > totalPages) {
      return new Response(
        JSON.stringify({
          error: "Requested page exceeds total available pages.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const responseData = {
      totalPages,
      data,
    };

    // setCachedData(cacheKey, responseData).catch(console.error);

    return new Response(JSON.stringify(responseData), {
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
