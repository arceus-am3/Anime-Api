import * as cheerio from "cheerio";
import { DEFAULT_HEADERS } from "../configs/header.config.js";
import { v1_base_url } from "../utils/base_v1.js";
import {
  FILTER_LANGUAGE_MAP,
  GENRE_MAP,
  FILTER_TYPES,
  FILTER_STATUS,
  FILTER_RATED,
  FILTER_SCORE,
  FILTER_SEASON,
  FILTER_SORT,
} from "../routes/filter.maping.js";

async function extractSearchResults(params = {}) {
  try {
    const normalizeParam = (param, mapping) => {
      if (!param) return undefined;
      const key = String(param).trim().toUpperCase();
      return mapping[key] ?? param;
    };

    const filteredParams = {
      keyword: params.keyword,
      type: normalizeParam(params.type, FILTER_TYPES),
      status: normalizeParam(params.status, FILTER_STATUS),
      rated: normalizeParam(params.rated, FILTER_RATED),
      score: normalizeParam(params.score, FILTER_SCORE),
      season: normalizeParam(params.season, FILTER_SEASON),
      sort: normalizeParam(params.sort, FILTER_SORT),
      language: FILTER_LANGUAGE_MAP[String(params.language || "").toUpperCase()],
      genres: params.genres,
      page: params.page || 1,
    };

    Object.keys(filteredParams).forEach(
      (k) => filteredParams[k] == null && delete filteredParams[k]
    );

    const query = new URLSearchParams(filteredParams).toString();
    const url = `https://${v1_base_url}/search?${query}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
      },
    });

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const items = [];
    $("#main-content .film_list-wrap .flw-item").each((_, el) => {
      items.push({
        id:
          $(el)
            .find(".film-name .dynamic-name")
            .attr("href")
            ?.slice(1)
            ?.split("?")[0] || null,
        title: $(el).find(".dynamic-name").text().trim(),
        poster: $(el).find(".film-poster-img").attr("data-src") || null,
      });
    });

    const totalPage =
      Number(
        $('.pagination a[title="Last"]')
          ?.attr("href")
          ?.split("=")
          .pop()
      ) || 1;

    return {
      totalPage,
      data: items,
    };
  } catch (err) {
    console.error("Search extractor error:", err);
    return {
      totalPage: 0,
      data: [],
    };
  }
}

export default extractSearchResults;
