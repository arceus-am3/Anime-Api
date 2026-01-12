import extractPage from "../helper/extractPages.helper.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export async function getProducer(request, params) {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Producer id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(request.url);
    const requestedPage = parseInt(url.searchParams.get("page")) || 1;

    const routeType = `producer/${id}`;
    // const cacheKey = `${routeType.replace(/\//g, "_")}_page_${requestedPage}`;

    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return new Response(JSON.stringify(cachedResponse), {
    //     status: 200,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    const [data, totalPages] = await extractPage(requestedPage, routeType);

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
      data,
      totalPages,
    };

    // setCachedData(cacheKey, responseData).catch(console.error);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
