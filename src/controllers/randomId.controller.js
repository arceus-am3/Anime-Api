import extractRandomId from "../extractors/randomId.extractor.js";

export const getRandomId = async () => {
  try {
    const data = await extractRandomId();
    return data;
  } catch (error) {
    console.error("Error getting random anime ID:", error);
    throw new Error("Failed to fetch random anime ID");
  }
};
