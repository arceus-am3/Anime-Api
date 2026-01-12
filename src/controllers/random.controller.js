import extractRandom from "../extractors/random.extractor.js";

export const getRandom = async () => {
  try {
    const data = await extractRandom();

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
    console.error("Error getting random anime:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch random anime",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
