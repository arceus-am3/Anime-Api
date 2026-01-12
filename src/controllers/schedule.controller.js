import extractSchedule from "../extractors/schedule.extractor.js";

export async function getSchedule(request) {
  try {
    const url = new URL(request.url);

    const date = url.searchParams.get("date");
    const tzOffset = parseInt(url.searchParams.get("tzOffset")) || -330;

    if (!date) {
      return new Response(
        JSON.stringify({ error: "date query parameter is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await extractSchedule(date, tzOffset);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({ error: "Failed to fetch schedule" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
