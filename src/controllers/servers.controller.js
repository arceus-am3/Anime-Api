import { extractServers } from "../extractors/streamInfo.extractor.js";

export const getServers = async (req) => {
  try {
    const { ep } = req.query;

    if (!ep) {
      throw new Error("ep query parameter is required");
    }

    const servers = await extractServers(ep);
    return servers;
  } catch (error) {
    console.error("Error fetching servers:", error);
    throw new Error("Failed to fetch servers");
  }
};
