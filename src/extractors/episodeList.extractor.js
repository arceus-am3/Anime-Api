import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractEpisodesList(id) {
  try {
    const showId = id.split("-").pop();

    const response = await fetch(
      `https://${v1_base_url}/ajax/v2/episode/list/${showId}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `https://${v1_base_url}/watch/${id}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch episode list: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.html) return [];

    const $ = cheerio.load(json.html);

    const result = {
      totalEpisodes: 0,
      episodes: [],
    };

    const episodeEls = $(".detail-infor-content .ss-list a");
    result.totalEpisodes = Number(episodeEls.length);

    episodeEls.each((_, el) => {
      result.episodes.push({
        episode_no: Number($(el).attr("data-number")),
        id: $(el).attr("href")?.split("/")?.pop() || null,
        title: $(el).attr("title")?.trim() || null,
        japanese_title: $(el).find(".ep-name").attr("data-jname") || null,
        filler: $(el).hasClass("ssl-item-filler"),
      });
    });

    return result;
  } catch (error) {
    console.error("Error extracting episode list:", error);
    return [];
  }
}

export default extractEpisodesList;
