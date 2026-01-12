// Cloudflare Workers–compatible AniList translation helper

async function getEnglishTitleFromAniList(userInput) {
  try {
    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          title {
            romaji
            english
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        query,
        variables: { search: userInput },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`AniList request failed: ${response.status}`);
    }

    const json = await response.json();
    const titles = json?.data?.Media?.title;

    if (!titles) {
      console.log(`AniList no match found for: ${userInput}`);
      return userInput;
    }

    return titles.english || titles.romaji || userInput;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("AniList request timed out");
      return userInput;
    }
    console.error("AniList API Error:", error.message);
    return userInput;
  }
}

async function convertForeignLanguage(userInput) {
  try {
    if (!userInput) return "";

    // Only Latin characters → return as-is
    if (/^[a-zA-Z\s]+$/.test(userInput)) {
      return userInput;
    }

    // Japanese / Chinese / Korean detection
    const isForeign =
      /[\u3040-\u30ff\u3000-\u303f\u4e00-\u9faf\uac00-\ud7af]/.test(
        userInput
      );

    if (isForeign) {
      return await getEnglishTitleFromAniList(userInput);
    }

    return userInput;
  } catch (error) {
    console.error(`Error converting foreign input ${userInput}:`, error);
    return userInput;
  }
}

export default convertForeignLanguage;
