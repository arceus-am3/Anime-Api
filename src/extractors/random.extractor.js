import { v1_base_url } from "../utils/base_v1.js";
import extractAnimeInfo from "./animeInfo.extractor.js";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

export default async function extractRandom() {
  try {
    const response = await fetch(`https://${v1_base_url}/random`, {
      headers: {
        ...DEFAULT_HEADERS,
      },
      redirect: "manual", // IMPORTANT: handle redirect manually
    });

    // 302 / 301 expected
    const location =
      response.headers.get("Location") ||
      response.headers.get("location");

    if (!location) {
      throw new Error("No redirect location found for random anime");
    }

    // Example: https://site/anime/naruto-shippuden-355
    const id = location.split("/").pop();

    if (!id) {
      throw new Error("Failed to extract anime id from redirect URL");
    }

    const animeInfo = await extractAnimeInfo(id);
    return animeInfo;
  } catch (error) {
    console.error("Error extracting random anime info:", error);
    return null;
  }
}
