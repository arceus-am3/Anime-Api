import * as cheerio from "cheerio";
import { v1_base_url } from "../utils/base_v1.js";
import { decryptSources_v1 } from "../parsers/decryptors/decrypt_v1.decryptor.js";

export async function extractServers(id) {
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
    const serverData = [];

    $(".server-item").each((_, element) => {
      serverData.push({
        type: $(element).attr("data-type"),
        data_id: $(element).attr("data-id"),
        server_id: $(element).attr("data-server-id"),
        serverName: $(element).find("a").text().trim(),
      });
    });

    return serverData;
  } catch (error) {
    console.error("Error extracting servers:", error);
    return [];
  }
}

async function extractStreamingInfo(id, name, type, fallback = false) {
  try {
    const episodeId = id.split("?ep=").pop();
    const servers = await extractServers(episodeId);

    let requestedServer = servers.filter(
      (server) =>
        server.serverName.toLowerCase() === name.toLowerCase() &&
        server.type.toLowerCase() === type.toLowerCase()
    );

    if (requestedServer.length === 0) {
      requestedServer = servers.filter(
        (server) =>
          server.serverName.toLowerCase() === name.toLowerCase() &&
          server.type.toLowerCase() === "raw"
      );
    }

    if (requestedServer.length === 0) {
      throw new Error(
        `No matching server found for name=${name}, type=${type}`
      );
    }

    const streamingLink = await decryptSources_v1(
      id,
      requestedServer[0].data_id,
      name,
      type,
      fallback
    );

    return { streamingLink, servers };
  } catch (error) {
    console.error("Error extracting streaming info:", error);
    return { streamingLink: [], servers: [] };
  }
}

export { extractStreamingInfo };
