import api from "../api";

const CACHE_TTL_MS = 60_000;
const cache = new Map();

export function getPublicResponse(url) {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const entry = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    promise: null,
  };

  entry.promise = api.get(url).catch((error) => {
    if (cache.get(url) === entry) {
      cache.delete(url);
    }
    throw error;
  });
  cache.set(url, entry);

  return entry.promise;
}
