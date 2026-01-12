import { extractStreamingInfo } from "../extractors/streamInfo.extractor.js";

export const getStreamInfo = async (req, res, fallback = false) => {
  try {
    const { id: input, server, type } = req.query;

    if (!input) {
      throw new Error("id query parameter is required");
    }

    // input example: ?id=some-slug?ep=12
    const match = input.match(/ep=(\d+)/);
    if (!match) {
      throw new Error("Invalid URL format");
    }

    const finalId = match[1];

    const streamingInfo = await extractStreamingInfo(
      finalId,
      server,
      type,
      fallback
    );

    return streamingInfo;
  } catch (error) {
    console.error("Error in getStreamInfo:", error);
    throw new Error(error.message || "Failed to fetch stream info");
  }
};
