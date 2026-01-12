import extractSearchResults from "../extractors/search.extractor.js";
import convertForeignLanguage from "../helper/foreignInput.helper.js";

export const search = async (req) => {
  try {
    let {
      keyword,
      type,
      status,
      rated,
      score,
      season,
      language,
      genres,
      sort,
      sy,
      sm,
      sd,
      ey,
      em,
      ed,
    } = req.query;

    const page = parseInt(req.query.page, 10) || 1;

    // Convert foreign language keyword (safe)
    if (keyword) {
      keyword = await convertForeignLanguage(keyword);
    }

    const [totalPage, data] = await extractSearchResults({
      keyword,
      type,
      status,
      rated,
      score,
      season,
      language,
      genres,
      sort,
      page,
      sy,
      sm,
      sd,
      ey,
      em,
      ed,
    });

    if (page > totalPage) {
      const error = new Error("Requested page exceeds total available pages.");
      error.status = 404;
      throw error;
    }

    return { data, totalPage };
  } catch (error) {
    console.error("Error in search controller:", error);

    if (error.status === 404) {
      throw error;
    }

    throw new Error("An error occurred while processing your request.");
  }
};
