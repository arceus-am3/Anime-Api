import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractTopSearch() {
  try {
    const response = await fetch(`https://${v1_base_url}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top search page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $(".xhashtag a.item").each((_, element) => {
      const title = $(element).text().trim();
      const link = $(element).attr("href");
      results.push({ title, link });
    });

    return results;
  } catch (error) {
    console.error("Error extracting top search:", error);
    return [];
  }
}

export default extractTopSearch;
