import { CACHE_TTL_MS, FEED_API_URL, READ_LINKS_KEY } from '../config/feed';
import type { CachedFeed, FeedResponse } from '../types/feed';

const CACHE_KEY = 'signal_garden_feed_cache';
const JSONP_TIMEOUT_MS = 45000;

function readCache(): CachedFeed | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedFeed;
  } catch {
    return null;
  }
}

function writeCache(data: FeedResponse): void {
  const entry: CachedFeed = { data, cachedAt: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function getCachedFeed(): FeedResponse | null {
  const cached = readCache();
  if (!cached) return null;
  return cached.data;
}

export function isCacheFresh(): boolean {
  const cached = readCache();
  if (!cached) return false;
  return Date.now() - cached.cachedAt < CACHE_TTL_MS;
}

function validateFeedResponse(data: FeedResponse): FeedResponse {
  if (data.error) {
    throw new Error(data.error);
  }
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid feed response');
  }
  return data;
}

function buildFeedUrl(apiUrl: string): string {
  const url = new URL(apiUrl);
  if (!url.searchParams.has('action')) {
    url.searchParams.set('action', 'feed');
  }
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

/** googleusercontent echo URLs return JSON and allow fetch from the browser. */
async function fetchFeedHttp(apiUrl: string): Promise<FeedResponse> {
  const response = await fetch(buildFeedUrl(apiUrl));
  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }
  const text = await response.text();
  if (text.trim().startsWith('<')) {
    throw new Error('Feed returned HTML instead of JSON. Check FEED_API_URL in src/config/feed.ts.');
  }
  let data: FeedResponse;
  try {
    data = JSON.parse(text) as FeedResponse;
  } catch {
    throw new Error('Feed response was not valid JSON');
  }
  return validateFeedResponse(data);
}

/** script.google.com blocks fetch (no CORS) and JSONP breaks on redirect — avoid if possible. */
function fetchFeedJsonp(apiUrl: string): Promise<FeedResponse> {
  return new Promise((resolve, reject) => {
    const callbackName = `signalGarden_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    let script: HTMLScriptElement | null = null;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script?.remove();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Feed request timed out.'));
    }, JSONP_TIMEOUT_MS);

    (window as unknown as Record<string, (data: FeedResponse) => void>)[callbackName] = (
      data: FeedResponse
    ) => {
      cleanup();
      try {
        resolve(validateFeedResponse(data));
      } catch (err) {
        reject(err);
      }
    };

    script = document.createElement('script');
    const url = new URL(buildFeedUrl(apiUrl));
    url.searchParams.set('callback', callbackName);
    script.src = url.toString();
    script.onerror = () => {
      cleanup();
      reject(
        new Error(
          'Could not load feed via script.google.com. Use the script.googleusercontent.com echo URL in src/config/feed.ts instead.'
        )
      );
    };
    document.body.appendChild(script);
  });
}

async function fetchFeedRemote(apiUrl: string): Promise<FeedResponse> {
  if (apiUrl.includes('googleusercontent.com')) {
    return fetchFeedHttp(apiUrl);
  }
  return fetchFeedJsonp(apiUrl);
}

export async function fetchFeed(force = false): Promise<FeedResponse> {
  if (!force && isCacheFresh()) {
    const cached = getCachedFeed();
    if (cached) return cached;
  }

  if (!FEED_API_URL || FEED_API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    throw new Error('Set REACT_APP_FEED_API_URL or update FEED_API_URL in src/config/feed.ts');
  }

  const data = await fetchFeedRemote(FEED_API_URL);
  writeCache(data);
  return data;
}

export function getReadLinks(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_LINKS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markLinkRead(link: string): void {
  const set = getReadLinks();
  set.add(link);
  localStorage.setItem(READ_LINKS_KEY, JSON.stringify(Array.from(set)));
}

export function markLinkUnread(link: string): void {
  const set = getReadLinks();
  set.delete(link);
  localStorage.setItem(READ_LINKS_KEY, JSON.stringify(Array.from(set)));
}
