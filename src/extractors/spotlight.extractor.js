import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

async function extractSpotlights() {
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

    const slideElements = $(
      "div.deslide-wrap > div.container > div#slider > div.swiper-wrapper > div.swiper-slide"
    );

    const results = slideElements
      .map((_, ele) => {
        const poster = $(ele)
          .find(
            "div.deslide-item > div.deslide-cover > div.deslide-cover-img > img.film-poster-img"
          )
          .attr("data-src");

        const title = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-head-title"
          )
          .text()
          .trim();

        const japanese_title = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-head-title"
          )
          .attr("data-jname")
          ?.trim();

        const description = $(ele)
          .find(
            "div.deslide-item > div.deslide-item-content > div.desi-description"
          )
          .text()
          .trim();

        const href = $(ele)
          .find(
            ".deslide-item > .deslide-item-content > .desi-buttons > a:eq(0)"
          )
          .attr("href");

        const id = href?.split("/").pop();
        const data_id = id?.split("-").pop();

        const tvInfoMapping = {
          0: "showType",
          1: "duration",
          2: "releaseDate",
          3: "quality",
          4: "episodeInfo",
        };

        const tvInfo = {};

        $(ele)
          .find("div.sc-detail > div.scd-item")
          .each((index, element) => {
            const key = tvInfoMapping[index];
            let value = $(element).text().trim().replace(/\n/g, "");

            const tickContainer = $(element).find(".tick");
            if (tickContainer.length > 0) {
              value = {
                sub: tickContainer.find(".tick-sub").text().trim(),
                dub: tickContainer.find(".tick-dub").text().trim(),
              };
            }

            tvInfo[key] = value;
          });

        return {
          id,
          data_id,
          poster,
          title,
          japanese_title,
          description,
          tvInfo,
        };
      })
      .get();

    return results;
  } catch (error) {
    console.error("Error extracting spotlight data:", error);
    return [];
  }
}

export default extractSpotlights;
