import extractRandomId from "../extractors/randomId.extractor.js";

export const getRandomId = async () => {
  try {
    const data = await extractRandomId();

    return new Response(
      JSON.stringify({
        success: true,
        id: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting random anime ID:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch random anime ID",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
