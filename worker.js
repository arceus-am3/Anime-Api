import * as homeInfoController from "./src/controllers/homeInfo.controller.js";
import * as categoryController from "./src/controllers/category.controller.js";
import * as topTenController from "./src/controllers/topten.controller.js";
import * as animeInfoController from "./src/controllers/animeInfo.controller.js";
import * as streamController from "./src/controllers/streamInfo.controller.js";
import * as searchController from "./src/controllers/search.controller.js";
import * as episodeListController from "./src/controllers/episodeList.controller.js";
import * as suggestionsController from "./src/controllers/suggestion.controller.js";
import * as scheduleController from "./src/controllers/schedule.controller.js";
import * as serversController from "./src/controllers/servers.controller.js";
import * as randomController from "./src/controllers/random.controller.js";
import * as qtipController from "./src/controllers/qtip.controller.js";
import * as randomIdController from "./src/controllers/randomId.controller.js";
import * as producerController from "./src/controllers/producer.controller.js";
import * as characterListController from "./src/controllers/voiceactor.controller.js";
import * as nextEpisodeScheduleController from "./src/controllers/nextEpisodeSchedule.controller.js";
import { routeTypes } from "./src/routes/category.route.js";

import { getWatchlist } from "./src/controllers/watchlist.controller.js";
import getVoiceActors from "./src/controllers/actors.controller.js";


import { getCharacter } from "./src/controllers/characters.controller.js";
import * as filterController from "./src/controllers/filter.controller.js";
import { getTopSearch } from "./src/controllers/topsearch.controller.js";

/* ------------------ HELPER ------------------ */
function matchPath(pattern, pathname) {
  const keys = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
      }) +
      "$"
  );

  const match = pathname.match(regex);
  if (!match) return null;

  const params = {};
  keys.forEach((k, i) => (params[k] = match[i + 1]));
  return params;
}

/* ------------------ ROUTES ------------------ */
export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      /* ===== HOME ===== */
      if (path === "/api" || path === "/api/") {
        return await homeInfoController.getHomeInfo(request);
      }

      /* ===== CATEGORY ===== */
      for (const type of routeTypes) {
        if (path === `/api/${type}`) {
          return await categoryController.getCategory(request, type);
        }
      }

      /* ===== NORMAL ROUTES ===== */
      if (path === "/api/top-ten")
        return await topTenController.getTopTen(request);

      if (path === "/api/info")
        return await animeInfoController.getAnimeInfo(request);

      let params;

      if ((params = matchPath("/api/episodes/:id", path)))
        return await episodeListController.getEpisodes(request, params);

      if ((params = matchPath("/api/servers/:id", path)))
        return await serversController.getServers(request, params);

      if (path === "/api/stream")
        return await streamController.getStreamInfo(request, false);

      if (path === "/api/stream/fallback")
        return await streamController.getStreamInfo(request, true);

      if (path === "/api/search")
        return await searchController.search(request);

      if (path === "/api/filter")
        return await filterController.filter(request);

      if (path === "/api/search/suggest")
        return await suggestionsController.getSuggestions(request);

      if (path === "/api/schedule")
        return await scheduleController.getSchedule(request);

      if ((params = matchPath("/api/schedule/:id", path)))
        return await nextEpisodeScheduleController.getNextEpisodeSchedule(
          request,
          params
        );

      if (path === "/api/random")
        return await randomController.getRandom(request);

      if (path === "/api/random/id")
        return await randomIdController.getRandomId(request);

      if ((params = matchPath("/api/qtip/:id", path)))
        return await qtipController.getQtip(request, params);

      if ((params = matchPath("/api/producer/:id", path)))
        return await producerController.getProducer(request, params);

      if ((params = matchPath("/api/character/list/:id", path)))
        return await characterListController.getVoiceActors(request, params);

      /* ===== WATCHLIST ===== */
      if ((params = matchPath("/api/watchlist/:userId/:page", path)))
        return await getWatchlist(request, params);

      if ((params = matchPath("/api/watchlist/:userId", path)))
        return await getWatchlist(request, params);

      /* ===== ACTORS / CHARACTER ===== */
      if ((params = matchPath("/api/actors/:id", path)))
        return await getVoiceActors(request, params);

      if ((params = matchPath("/api/character/:id", path)))
        return await getCharacter(request, params);

      if (path === "/api/top-search")
        return await getTopSearch(request);

      /* ===== 404 ===== */
      return new Response(
        JSON.stringify({ success: false, message: "Route not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, message: err.message }),
        { status: 500 }
      );
    }
  },
};
