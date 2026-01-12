import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractSchedule(date, tzOffset) {
  try {
    tzOffset = tzOffset ?? -330;

    const response = await fetch(
      `https://${v1_base_url}/ajax/schedule/list?tzOffset=${tzOffset}&date=${date}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.html) return [];

    const $ = cheerio.load(json.html);
    const results = [];

    $("li").each((_, element) => {
      const href = $(element).find("a").attr("href");
      if (!href) return;

      const id = href.split("?")[0].replace("/", "");
      const data_id = id?.split("-").pop();

      results.push({
        id,
        data_id,
        title: $(element).find(".film-name").text().trim(),
        japanese_title: $(element)
          .find(".film-name")
          .attr("data-jname")
          ?.trim() || null,
        releaseDate: date,
        time: $(element).find(".time").text().trim(),
        episode_no: $(element)
          .find(".btn-play")
          .text()
          .trim()
          .split(" ")
          .pop(),
      });
    });

    return results;
  } catch (error) {
    console.error("Error extracting schedule:", error.message);
    return [];
  }
}
