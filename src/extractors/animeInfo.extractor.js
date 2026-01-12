import * as cheerio from "cheerio";
import formatTitle from "../helper/formatTitle.helper.js";
import { v1_base_url } from "../utils/base_v1.js";
import extractRecommendedData from "./recommend.extractor.js";
import extractRelatedData from "./related.extractor.js";
import extractPopularData from "./popular.extractor.js";

async function extractAnimeInfo(id) {
  try {
    const animeUrl = `https://${v1_base_url}/${id}`;
    const characterUrl = `https://${v1_base_url}/ajax/character/list/${id
      .split("-")
      .pop()}`;

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    };

    const [animeRes, characterRes] = await Promise.all([
      fetch(animeUrl, { headers }),
      fetch(characterUrl, { headers }),
    ]);

    if (!animeRes.ok) {
      throw new Error(`Failed to fetch anime page: ${animeRes.status}`);
    }

    const animeHtml = await animeRes.text();
    const characterJson = characterRes.ok ? await characterRes.json() : {};
    const characterHtml = characterJson?.html || "";

    const $ = cheerio.load(animeHtml);
    const $1 = cheerio.load(characterHtml);

    const data_id = id.split("-").pop();

    // ===== BASIC INFO =====
    const titleElement = $("#ani_detail .film-name");
    const title = titleElement.text().trim();
    const japanese_title = titleElement.attr("data-jname");

    const showType = $("#ani_detail .prebreadcrumb ol li")
      .eq(1)
      .find("a")
      .text()
      .trim();

    const poster = $("#ani_detail .film-poster img").attr("src");

    const synonyms = $(
      '.item.item-title:has(.item-head:contains("Synonyms")) .name'
    )
      .text()
      .trim();

    // ===== SYNC DATA =====
    let anilistId = null;
    let malId = null;

    const syncDataScript = $("#syncData").html();
    if (syncDataScript) {
      try {
        const syncData = JSON.parse(syncDataScript);
        anilistId = syncData.anilist_id || null;
        malId = syncData.mal_id || null;
      } catch (err) {
        console.error("Error parsing syncData:", err);
      }
    }

    // ===== TV INFO =====
    const tvInfo = {};
    $("#ani_detail .film-stats")
      .find(".tick-item, span.item")
      .each((_, el) => {
        const text = $(el).text().trim();
        if ($(el).hasClass("tick-quality")) tvInfo.quality = text;
        else if ($(el).hasClass("tick-sub")) tvInfo.sub = text;
        else if ($(el).hasClass("tick-dub")) tvInfo.dub = text;
        else if ($(el).hasClass("tick-eps")) tvInfo.eps = text;
        else if ($(el).hasClass("tick-pg")) tvInfo.rating = text;
        else if ($(el).is("span.item")) {
          if (!tvInfo.showType) tvInfo.showType = text;
          else if (!tvInfo.duration) tvInfo.duration = text;
        }
      });

    // ===== META INFO =====
    const animeInfo = {};
    $(
      "#ani_detail .anisc-info-wrap .anisc-info .item"
    ).each((_, el) => {
      const key = $(el)
        .find(".item-head")
        .text()
        .trim()
        .replace(":", "");
      const value =
        key === "Genres" || key === "Producers"
          ? $(el)
              .find("a")
              .map((_, a) => $(a).text().replace(/\s+/g, "-").trim())
              .get()
          : $(el).find(".name").text().replace(/\s+/g, "-").trim();
      animeInfo[key] = value;
    });

    animeInfo.Overview = $("#ani_detail .film-description .text")
      .text()
      .trim();
    animeInfo.tvInfo = tvInfo;

    // ===== TRAILERS =====
    animeInfo.trailers = [];
    $(".block_area-promotions-list .item").each((_, el) => {
      const url = $(el).attr("data-src");
      if (!url) return;

      const fullUrl = url.startsWith("//") ? `https:${url}` : url;
      const match = fullUrl.match(/\/embed\/([^?&]+)/);

      animeInfo.trailers.push({
        title: $(el).attr("data-title") || null,
        url: fullUrl,
        thumbnail: match
          ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
          : null,
      });
    });

    // ===== ADULT CHECK =====
    const adultContent = $(".tick-rate").text().includes("18+");

    // ===== EXTRA DATA =====
    const [recommended_data, related_data, popular_data] = await Promise.all([
      extractRecommendedData($),
      extractRelatedData($),
      extractPopularData($),
    ]);

    // ===== CHARACTERS & VA =====
    let charactersVoiceActors = [];
    if (characterHtml) {
      charactersVoiceActors = $1(".bac-list-wrap .bac-item")
        .map((_, el) => {
          const character = {
            id:
              $1(el)
                .find(".per-info.ltr .pi-avatar")
                .attr("href")
                ?.split("/")[2] || "",
            poster:
              $1(el)
                .find(".per-info.ltr .pi-avatar img")
                .attr("data-src") || "",
            name: $1(el)
              .find(".per-info.ltr .pi-detail a")
              .text()
              .trim(),
            cast: $1(el)
              .find(".per-info.ltr .pi-detail .pi-cast")
              .text()
              .trim(),
          };

          const voiceActors = $1(el)
            .find(".per-info.rtl, .per-info-xx .pi-avatar")
            .map((_, actorEl) => ({
              id:
                $1(actorEl).find("a").attr("href")?.split("/").pop() ||
                $1(actorEl).attr("href")?.split("/").pop() ||
                "",
              poster: $1(actorEl).find("img").attr("data-src") || "",
              name:
                $1(actorEl)
                  .find(".pi-detail .pi-name a")
                  .text()
                  .trim() ||
                $1(actorEl).attr("title") ||
                "",
            }))
            .get();

          return { character, voiceActors };
        })
        .get();
    }

    const season_id = formatTitle(title, data_id);

    return {
      adultContent,
      data_id,
      id: season_id,
      anilistId,
      malId,
      title,
      japanese_title,
      synonyms,
      poster,
      showType,
      animeInfo,
      charactersVoiceActors,
      recommended_data,
      related_data,
      popular_data,
    };
  } catch (e) {
    console.error("Error extracting anime info:", e);
    throw new Error("Failed to extract anime info");
  }
}

export default extractAnimeInfo;
