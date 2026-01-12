import * as cheerio from "cheerio";
import { DEFAULT_HEADERS } from "../configs/header.config.js";

async function countPages(url) {
  try {
    const response = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const lastPageHref = $(
      ".tab-content .pagination .page-item:last-child a"
    ).attr("href");

    const lastPageNumber = lastPageHref
      ? parseInt(lastPageHref.split("=").pop(), 10)
      : 1;

    return Number.isNaN(lastPageNumber) ? 1 : lastPageNumber;
  } catch (error) {
    console.error("Error counting pages:", error);
    return 1;
  }
}

export default countPages;
