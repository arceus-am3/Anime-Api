import extractQtip from "../extractors/qtip.extractor.js";

export const getQtip = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("Qtip id is required");
    }

    const data = await extractQtip(id);
    return data;
  } catch (error) {
    console.error("Error fetching qtip:", error);
    throw new Error("Failed to fetch qtip data");
  }
};
