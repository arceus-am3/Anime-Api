import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

async function extractPage(page, params) {
  try {
    const url = `https://${v1_base_url}/${params}?page=${page}`;

    const response = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page ${page}: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ===== pagination =====
    const totalPages =
      Number(
        $('.pre-pagination nav .pagination > .page-item a[title="Last"]')
          ?.attr("href")
          ?.split("=")
          .pop() ??
          $('.pre-pagination nav .pagination > .page-item a[title="Next"]')
            ?.attr("href")
            ?.split("=")
            .pop() ??
          $(".pre-pagination nav .pagination > .page-item.active a")
            ?.text()
            ?.trim()
      ) || 1;

    // ===== content selector =====
    const contentSelector = params.includes("az-list")
      ? ".tab-content"
      : "#main-content";

    // ===== items =====
    const data = $(`${contentSelector} .film_list-wrap .flw-item`)
      .map((_, element) => {
        const $fdiItems = $(".film-detail .fd-infor .fdi-item", element);

        const showType = $fdiItems
          .filter((_, item) => {
            const text = $(item).text().trim().toLowerCase();
            return ["tv", "ona", "movie", "ova", "special", "music"].some(
              (type) => text.includes(type)
            );
          })
          .first();

        const poster = $(".film-poster > img", element).attr("data-src");
        const title = $(".film-detail .film-name", element).text().trim();
        const japanese_title = $(".film-detail > .film-name > a", element).attr(
          "data-jname"
        );

        const description = $(".film-detail .description", element)
          .text()
          .trim();

        const data_id = $(".film-poster > a", element).attr("data-id");
        const id = $(".film-poster > a", element)
          .attr("href")
          ?.split("/")
          .pop();

        const tvInfo = {
          showType: showType ? showType.text().trim() : "Unknown",
          duration: $(".film-detail .fd-infor .fdi-duration", element)
            .text()
            .trim(),
        };

        let adultContent = false;
        const tickRateText = $(".film-poster > .tick-rate", element)
          .text()
          .trim();

        if (tickRateText.includes("18+")) adultContent = true;

        ["sub", "dub", "eps"].forEach((property) => {
          const value = $(`.tick .tick-${property}`, element).text().trim();
          if (value) tvInfo[property] = value;
        });

        return {
          id,
          data_id,
          poster,
          title,
          japanese_title,
          description,
          tvInfo,
          adultContent,
        };
      })
      .get();

    return [data, parseInt(totalPages, 10)];
  } catch (error) {
    console.error(`Error extracting data from page ${page}:`, error);
    return [[], 1];
  }
}

export default extractPage;
