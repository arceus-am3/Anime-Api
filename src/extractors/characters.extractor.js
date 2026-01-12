import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export async function extractCharacter(id) {
  try {
    const response = await fetch(
      `https://${v1_base_url}/character/${id}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch character page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ===== BASIC INFO =====
    const name = $(".apw-detail .name").text().trim();
    const japaneseName = $(".apw-detail .sub-name").text().trim();

    // ===== PROFILE IMAGE =====
    const profile = $(".avatar-circle img").attr("src");

    // ===== ABOUT =====
    const bioText = $("#bio .bio").text().trim();
    const bioHtml = $("#bio .bio").html();

    const about = {
      description: bioText,
      style: bioHtml,
    };

    // ===== VOICE ACTORS =====
    const voiceActors = [];
    $("#voiactor .per-info").each((_, element) => {
      const el = $(element);

      const voiceActor = {
        name: el.find(".pi-name a").text().trim(),
        profile: el.find(".pi-avatar img").attr("src"),
        language: el.find(".pi-cast").text().trim(),
        id: el.find(".pi-name a").attr("href")?.split("/").pop(),
      };

      if (voiceActor.name && voiceActor.id) {
        voiceActors.push(voiceActor);
      }
    });

    // ===== ANIMEOGRAPHY =====
    const animeography = [];
    $(".anif-block-ul li").each((_, el) => {
      const item = $(el);
      const anchor = item.find(".film-name a.dynamic-name");

      const title = anchor.text().trim();
      const japanese_title = anchor.attr("data-jname")?.trim();
      const animeId = anchor.attr("href")?.split("/").pop();
      const role = item.find(".fdi-item").first().text().trim();
      const type = item.find(".fdi-item").last().text().trim();
      const poster = item.find(".film-poster img").attr("src");

      if (title && animeId) {
        animeography.push({
          title,
          japanese_title,
          id: animeId,
          role: role.replace(" (Role)", ""),
          type,
          poster,
        });
      }
    });

    // ===== FINAL RESPONSE =====
    return {
      success: true,
      results: {
        data: [
          {
            id,
            name,
            profile,
            japaneseName,
            about,
            voiceActors,
            animeography,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error extracting character data:", error);
    throw new Error("Failed to extract character information");
  }
}

export default extractCharacter;
