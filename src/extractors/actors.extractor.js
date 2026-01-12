import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export async function extractVoiceActor(id) {
  try {
    const response = await fetch(`https://${v1_base_url}/people/${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ===== BASIC INFO =====
    const name = $(".apw-detail .name").text().trim();
    const japaneseName = $(".apw-detail .sub-name").text().trim();

    // ===== PROFILE IMAGE =====
    const profile = $(".avatar-circle img").attr("src");

    // ===== ABOUT / BIO =====
    const bioText = $("#bio .bio").text().trim();
    const bioHtml = $("#bio .bio").html();

    const about = {
      description: bioText,
      style: bioHtml,
    };

    // ===== ROLES =====
    const roles = [];

    $(".bac-list-wrap .bac-item").each((_, element) => {
      const animeElement = $(element).find(".per-info.anime-info.ltr");
      const characterElement = $(element).find(".per-info.rtl");

      roles.push({
        anime: {
          id: animeElement.find(".pi-name a").attr("href")?.split("/").pop(),
          title: animeElement.find(".pi-name a").text().trim(),
          poster:
            animeElement.find(".pi-avatar img").attr("data-src") ||
            animeElement.find(".pi-avatar img").attr("src"),
          type: animeElement
            .find(".pi-cast")
            .text()
            .trim()
            .split(",")[0]
            ?.trim(),
          year: animeElement
            .find(".pi-cast")
            .text()
            .trim()
            .split(",")[1]
            ?.trim(),
        },
        character: {
          id: characterElement
            .find(".pi-name a")
            .attr("href")
            ?.split("/")
            .pop(),
          name: characterElement.find(".pi-name a").text().trim(),
          profile:
            characterElement.find(".pi-avatar img").attr("data-src") ||
            characterElement.find(".pi-avatar img").attr("src"),
          role: characterElement.find(".pi-cast").text().trim(),
        },
      });
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
            roles,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error extracting voice actor data:", error);
    throw new Error("Failed to extract voice actor information");
  }
}

export default extractVoiceActor;
