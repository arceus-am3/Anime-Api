import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function getSuggestions(keyword) {
  try {
    const response = await fetch(
      `https://${v1_base_url}/ajax/search/suggest?keyword=${keyword}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.html) return [];

    const $ = cheerio.load(json.html);
    const results = [];

    $(".nav-item")
      .not(".nav-bottom")
      .each((_, element) => {
        const href = $(element).attr("href");
        if (!href) return;

        const id = href.split("?")[0].replace("/", "");
        const data_id = id.split("-").pop();

        const poster = $(element)
          .find(".film-poster-img")
          .attr("data-src");

        const title = $(element).find(".film-name").text().trim();
        const japanese_title = $(element)
          .find(".film-name")
          .attr("data-jname")
          ?.trim();

        const releaseDate = $(element)
          .find(".film-infor span")
          .first()
          .text()
          .trim();

        const filmInforHtml = $(element).find(".film-infor").html() || "";
        const showTypeMatch =
          /<i class="dot"><\/i>([^<]+)<i class="dot"><\/i>/;
        const showType = showTypeMatch.exec(filmInforHtml)?.[1]?.trim() || "";

        const duration = $(element)
          .find(".film-infor span")
          .last()
          .text()
          .trim();

        results.push({
          id,
          data_id,
          poster,
          title,
          japanese_title,
          releaseDate,
          showType,
          duration,
        });
      });

    return results;
  } catch (error) {
    console.error("Error extracting suggestions:", error);
    return [];
  }
}

export default getSuggestions;
