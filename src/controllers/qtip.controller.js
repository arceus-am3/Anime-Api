import extractQtip from "../extractors/qtip.extractor.js";

export const getQtip = async (request, params) => {
  try {
    const id = params?.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Qtip id is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await extractQtip(id);

    return new Response(
      JSON.stringify({
        success: true,
        results: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching qtip:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch qtip data",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
