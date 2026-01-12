import * as cheerio from "cheerio";
import { v2_base_url } from "../utils/base_v2.js";

export async function fetchServerData_v2(id) {
  try {
    const response = await fetch(
      `https://${v2_base_url}/ajax/episode/servers?episodeId=${id}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch servers v2: ${response.status}`);
    }

    const json = await response.json();
    if (!json?.html) return [];

    const $ = cheerio.load(json.html);

    const serverData = $("div.ps_-block > div.ps__-list > div.server-item")
      .filter((_, ele) => {
        const name = $(ele).find("a.btn").text().trim();
        return name === "Vidcloud";
      })
      .map((_, ele) => ({
        name: $(ele).find("a.btn").text().trim(),
        id: $(ele).attr("data-id"),
        type: $(ele).attr("data-type"),
      }))
      .get();

    return serverData;
  } catch (error) {
    console.error("Error fetching server data v2:", error);
    return [];
  }
}
