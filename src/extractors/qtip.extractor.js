import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export default async function extractQtip(id) {
  try {
    const response = await fetch(
      `https://${v1_base_url}/ajax/movie/qtip/${id}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch qtip data: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $(".pre-qtip-title").text().trim();
    const rating = $(".pqd-li i.fas.fa-star").parent().text().trim();
    const quality = $(".tick-item.tick-quality").text().trim();
    const subCount = $(".tick-item.tick-sub").text().trim();
    const dubCount = $(".tick-item.tick-dub").text().trim();
    const episodeCount = $(".tick-item.tick-eps").text().trim();
    const type = $(".badge.badge-quality").text().trim();
    const description = $(".pre-qtip-description").text().trim();

    const japaneseTitle = $(
      ".pre-qtip-line:contains('Japanese:') .stick-text"
    )
      .text()
      .trim();

    const airedDate = $(
      ".pre-qtip-line:contains('Aired:') .stick-text"
    )
      .text()
      .trim();

    const status = $(
      ".pre-qtip-line:contains('Status:') .stick-text"
    )
      .text()
      .trim();

    const Synonyms = $(
      ".pre-qtip-line:contains('Synonyms:') .stick-text"
    )
      .text()
      .trim();

    const genres = [];
    $(".pre-qtip-line:contains('Genres:') a").each((_, el) => {
      genres.push($(el).text().trim().replace(/\s+/g, "-"));
    });

    const watchLink = $(".pre-qtip-button a.btn.btn-play").attr("href") || null;

    return {
      title,
      rating,
      quality,
      subCount,
      dubCount,
      episodeCount,
      type,
      description,
      japaneseTitle,
      Synonyms,
      airedDate,
      status,
      genres,
      watchLink,
    };
  } catch (error) {
    console.error("Error extracting qtip data:", error);
    return null;
  }
}
