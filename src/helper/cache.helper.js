// Cloudflare Workers KV cache helper

export const getCachedData = async (env, key) => {
  try {
    if (!env?.CACHE) return null;

    const cached = await env.CACHE.get(key, { type: "json" });
    return cached ?? null;
  } catch (error) {
    console.error("KV get error:", error);
    return null;
  }
};

export const setCachedData = async (env, key, value, ttl = 3600) => {
  try {
    if (!env?.CACHE) return;

    await env.CACHE.put(key, JSON.stringify(value), {
      expirationTtl: ttl, // seconds
    });
  } catch (error) {
    console.error("KV set error:", error);
  }
};
