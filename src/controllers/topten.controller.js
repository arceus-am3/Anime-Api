import extractTopTen from "../extractors/topten.extractor.js";
// import { getCachedData, setCachedData } from "../helper/cache.helper.js";

export async function getTopTen(request) {
  try {
    // const cacheKey = "topTen";

    // const cachedResponse = await getCachedData(cacheKey);
    // if (cachedResponse && Object.keys(cachedResponse).length > 0) {
    //   return new Response(JSON.stringify(cachedResponse), {
    //     status: 200,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }

    const topTen = await extractTopTen();

    // setCachedData(cacheKey, topTen).catch(console.error);

    return new Response(JSON.stringify(topTen), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
