import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractSeasons(id) {
  try {
    const response = await fetch(
      `https://${v1_base_url}/watch/${id}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch seasons page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const seasons = $(".anis-watch > .other-season > .inner > .os-list > a")
      .map((index, element) => {
        const href = $(element).attr("href") || "";

        const data_number = index;
        const data_id = parseInt(href.split("-").pop(), 10);

        const season = $(element).find(".title").text().trim();
        const title = $(element).attr("title")?.trim() || null;

        const id = href.replace(/^\/+/, "");

        const style = $(element).find(".season-poster").attr("style") || "";
        const match = style.match(/url\((.*?)\)/);
        const season_poster = match ? match[1] : null;

        return {
          id,
          data_number,
          data_id,
          season,
          title,
          season_poster,
        };
      })
      .get();

    return seasons;
  } catch (e) {
    console.error("Error extracting seasons:", e);
    return [];
  }
}

export default extractSeasons;
