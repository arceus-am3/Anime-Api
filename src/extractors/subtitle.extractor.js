import { v1_base_url } from "../utils/base_v1.js";
import { provider } from "../utils/provider.js";

export async function extractSubtitle(id) {
  try {
    // Step 1: Get source link
    const sourceResp = await fetch(
      `https://${v1_base_url}/ajax/v2/episode/sources/?id=${id}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!sourceResp.ok) {
      throw new Error(`Failed to fetch episode source: ${sourceResp.status}`);
    }

    const sourceJson = await sourceResp.json();
    if (!sourceJson?.link) {
      throw new Error("No source link found");
    }

    // Clean embed id
    const embedId = sourceJson.link
      .split("/")
      .pop()
      .replace(/\?k=\d?/g, "");

    // Step 2: Fetch subtitles from provider
    const providerResp = await fetch(
      `${provider}/embed-2/ajax/e-1/getSources?id=${embedId}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      }
    );

    if (!providerResp.ok) {
      throw new Error(
        `Failed to fetch subtitle sources: ${providerResp.status}`
      );
    }

    const providerJson = await providerResp.json();

    const subtitles = providerJson.tracks || [];
    const intro = providerJson.intro || null;
    const outro = providerJson.outro || null;

    return { subtitles, intro, outro };
  } catch (error) {
    console.error("Error extracting subtitles:", error);
    return { subtitles: [], intro: null, outro: null };
  }
}
