import { v1_base_url } from "../utils/base_v1.js";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

export default async function extractRandomId() {
  try {
    const response = await fetch(`https://${v1_base_url}/random`, {
      headers: {
        ...DEFAULT_HEADERS,
      },
      redirect: "manual", // IMPORTANT: handle redirect manually
    });

    const location =
      response.headers.get("Location") ||
      response.headers.get("location");

    if (!location) {
      throw new Error("No redirect location found for random ID");
    }

    const id = location.split("/").pop();

    if (!id) {
      throw new Error("Failed to extract anime id from redirect URL");
    }

    return id;
  } catch (error) {
    console.error("Error extracting random anime ID:", error);
    return null;
  }
}
