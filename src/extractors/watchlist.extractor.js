import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractWatchlist(userId, page = 1) {
  try {
    const url = `https://${v1_base_url}/community/user/${userId}/watch-list?page=${page}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch watchlist: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const watchlist = [];

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

    // ===== items =====
    $(".flw-item").each((_, element) => {
      const title = $(".film-name a", element).text().trim();
      const poster = $(".film-poster img", element).attr("data-src");
      const duration = $(".fdi-duration", element).text().trim();
      const type = $(".fdi-item", element).first().text().trim();

      const link = $(".film-name a", element).attr("href");
      const animeId = link?.split("/").pop();

      const subCount = $(".tick-item.tick-sub", element).text().trim();
      const dubCount = $(".tick-item.tick-dub", element).text().trim();

      watchlist.push({
        id: animeId,
        title,
        poster,
        duration,
        type,
        subCount,
        dubCount,
        link: `https://${v1_base_url}${link}`,
        showType: type,
        tvInfo: {
          showType: type,
          duration,
          sub: subCount,
          dub: dubCount,
        },
      });
    });

    return { watchlist, totalPages };
  } catch (error) {
    console.error("Error extracting watchlist:", error);
    return { watchlist: [], totalPages: 1 };
  }
}
