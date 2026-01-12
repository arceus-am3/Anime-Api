import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function fetchAnimeDetails($element) {
  const data_id = $element.attr("data-id");
  const number = $element.find(".number > span").text().trim();
  const poster = $element.find("img").attr("data-src");
  const title = $element.find(".film-title").text().trim();
  const japanese_title = $element.find(".film-title").attr("data-jname")?.trim();
  const id = $element.find("a").attr("href")?.split("/").pop();

  return { id, data_id, number, poster, title, japanese_title };
}

async function extractTrending() {
  try {
    const response = await fetch(`https://${v1_base_url}/home`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch home page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const trendingElements = $("#anime-trending #trending-home .swiper-slide");

    const trendingData = await Promise.all(
      trendingElements
        .map((_, element) => fetchAnimeDetails($(element)))
        .get()
    );

    return trendingData;
  } catch (error) {
    console.error("Error extracting trending anime:", error);
    return [];
  }
}

export default extractTrending;
