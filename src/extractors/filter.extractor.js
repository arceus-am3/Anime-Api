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

async function extractFilterResults(params = {}) {
  try {
    const normalizeParam = (param, mapping) => {
      if (!param) return undefined;

      if (typeof param === "string") {
        const isAlreadyId = Object.values(mapping).includes(param);
        if (isAlreadyId) return param;

        const key = param.trim().toUpperCase();
        return mapping[key];
      }
      return param;
    };

    const typeParam = normalizeParam(params.type, FILTER_TYPES);
    const statusParam = normalizeParam(params.status, FILTER_STATUS);
    const ratedParam = normalizeParam(params.rated, FILTER_RATED);
    const scoreParam = normalizeParam(params.score, FILTER_SCORE);
    const seasonParam = normalizeParam(params.season, FILTER_SEASON);
    const sortParam = normalizeParam(params.sort, FILTER_SORT);

    let languageParam = params.language;
    if (languageParam != null) {
      languageParam = String(languageParam).trim().toUpperCase();
      languageParam =
        FILTER_LANGUAGE_MAP[languageParam] ??
        (Object.values(FILTER_LANGUAGE_MAP).includes(languageParam)
          ? languageParam
          : undefined);
    }

    let genresParam = params.genres;
    if (typeof genresParam === "string") {
      genresParam = genresParam
        .split(",")
        .map(
          (g) => GENRE_MAP[g.trim().toUpperCase()] || g.trim()
        )
        .join(",");
    }

    const filteredParams = {
      type: typeParam,
      status: statusParam,
      rated: ratedParam,
      score: scoreParam,
      season: seasonParam,
      language: languageParam,
      genres: genresParam,
      sort: sortParam,
      page: params.page || 1,
      sy: params.sy,
      sm: params.sm,
      sd: params.sd,
      ey: params.ey,
      em: params.em,
      ed: params.ed,
      keyword: params.keyword,
    };

    Object.keys(filteredParams).forEach(
      (k) => filteredParams[k] === undefined && delete filteredParams[k]
    );

    const query = new URLSearchParams(filteredParams).toString();

    const apiUrl = filteredParams.keyword
      ? `https://${v1_base_url}/search?${query}`
      : `https://${v1_base_url}/filter?${query}`;

    const response = await fetch(apiUrl, {
      headers: {
        ...DEFAULT_HEADERS,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch filter page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const result = [];

    $(".flw-item").each((_, el) => {
      const $el = $(el);
      const href = $el.find(".film-poster-ahref").attr("href");
      const data_id = $el.find(".film-poster-ahref").attr("data-id");

      result.push({
        id: href ? href.slice(1) : null,
        data_id: data_id ? `${data_id}` : null,
        poster:
          $el.find(".film-poster-img").attr("data-src") ||
          $el.find(".film-poster-img").attr("src") ||
          null,
        title: $el.find(".film-name .dynamic-name").text().trim(),
        japanese_title:
          $el.find(".film-name .dynamic-name").attr("data-jname") || null,
        tvInfo: {
          showType:
            $el.find(".fd-infor .fdi-item:first-child").text().trim() ||
            "Unknown",
          duration:
            $el.find(".fd-infor .fdi-duration").text().trim() || null,
          sub:
            Number(
              $el.find(".tick-sub").text().replace(/\D/g, "")
            ) || null,
          dub:
            Number(
              $el.find(".tick-dub").text().replace(/\D/g, "")
            ) || null,
          eps:
            Number(
              $el.find(".tick-eps").text().replace(/\D/g, "")
            ) || null,
        },
        adultContent: $el.find(".tick-rate").text().trim() || null,
      });
    });

    const totalPage = Number(
      $('.pagination a[title="Last"]')?.attr("href")?.split("=").pop() ||
        $('.pagination a[title="Next"]')?.attr("href")?.split("=").pop() ||
        $(".pagination .page-item.active a")?.text()?.trim() ||
        1
    );

    const currentPage = parseInt(params.page, 10) || 1;

    return [
      totalPage,
      result,
      currentPage,
      currentPage < totalPage,
    ];
  } catch (e) {
    console.error("Error fetching filter data:", e);
    throw e;
  }
}

export { extractFilterResults as default };
