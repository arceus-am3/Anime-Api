import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";

export async function fetchServerData_v1(id) {
  try {
    const response = await fetch(
      `https://${v1_base_url}/ajax/v2/episode/servers?episodeId=${id}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch servers: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.html) return [];

    const $ = cheerio.load(json.html);

    const serverData = $("div.ps_-block > div.ps__-list > div.server-item")
      .filter((_, ele) => {
        const name = $(ele).find("a.btn").text().trim();
        return name === "HD-1" || name === "HD-2";
      })
      .map((_, ele) => ({
        name: $(ele).find("a.btn").text().trim(),
        id: $(ele).attr("data-id"),
        type: $(ele).attr("data-type"),
      }))
      .get();

    return serverData;
  } catch (error) {
    console.error("Error fetching server data v1:", error);
    return [];
  }
}
