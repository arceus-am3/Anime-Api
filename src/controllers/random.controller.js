import extractRandom from "../extractors/random.extractor.js";

export const getRandom = async () => {
  try {
    const data = await extractRandom();
    return data;
  } catch (error) {
    console.error("Error getting random anime:", error);
    throw new Error("Failed to fetch random anime");
  }
};
