export interface FeedItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  source: string;
  category: string;
  image?: string;
}

export interface FeedResponse {
  fetchedAt: string;
  count: number;
  items: FeedItem[];
  error?: string;
}

export interface CachedFeed {
  data: FeedResponse;
  cachedAt: number;
}
