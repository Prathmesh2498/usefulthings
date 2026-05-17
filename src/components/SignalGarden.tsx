import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { FeedItem, FeedResponse } from '../types/feed';
import {
  fetchFeed,
  getCachedFeed,
  getReadLinks,
  markLinkRead,
  markLinkUnread,
} from '../lib/feedApi';
import '../styles/SignalGarden.css';

const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), 'day');
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFetchedAt = (iso: string): string => {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const SignalGarden: React.FC = () => {
  const [feed, setFeed] = useState<FeedResponse | null>(() => getCachedFeed());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [readLinks, setReadLinks] = useState<Set<string>>(() => getReadLinks());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadFeed = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(force);
      setFeed(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load feed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const categories = useMemo(() => {
    if (!feed?.items.length) return [];
    const set = new Set<string>();
    feed.items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [feed]);

  const filteredItems = useMemo(() => {
    if (!feed?.items) return [];
    return feed.items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (showUnreadOnly && readLinks.has(item.link)) return false;
      return true;
    });
  }, [feed, category, showUnreadOnly, readLinks]);

  const toggleRead = (item: FeedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (readLinks.has(item.link)) {
      markLinkUnread(item.link);
      setReadLinks((prev) => {
        const next = new Set(prev);
        next.delete(item.link);
        return next;
      });
    } else {
      markLinkRead(item.link);
      setReadLinks((prev) => new Set(prev).add(item.link));
    }
  };

  const openArticle = (item: FeedItem) => {
    if (item.link) {
      markLinkRead(item.link);
      setReadLinks((prev) => new Set(prev).add(item.link));
      window.open(item.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="signal-page">
      <header className="signal-header">
        <div className="signal-header-text">
          <h1 className="signal-title">Signal Garden</h1>
          <p className="signal-subtitle">Your curated feed — no algorithm required.</p>
        </div>
        <div className="signal-header-actions">
          {feed?.fetchedAt && (
            <span className="signal-updated">Updated {formatFetchedAt(feed.fetchedAt)}</span>
          )}
          <button
            type="button"
            className="signal-refresh"
            onClick={() => loadFeed(true)}
            disabled={loading}
            aria-label="Refresh feed"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="signal-feed">
        <div className="signal-toolbar">
        <div className="signal-filters" role="tablist" aria-label="Categories">
          <button
            type="button"
            role="tab"
            aria-selected={category === 'all'}
            className={`signal-chip ${category === 'all' ? 'active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={category === cat}
              className={`signal-chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="signal-unread-toggle">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          Unread only
        </label>
      </div>

      {error && (
        <div className="signal-error" role="alert">
          <p>{error}</p>
          <p className="signal-error-hint">
            Set <code>FEED_API_URL</code> to your{' '}
            <code>script.googleusercontent.com/macros/echo?...</code> URL (open /exec while
            logged in and copy the redirect address). See docs/SIGNAL-GARDEN-SETUP.md.
          </p>
        </div>
      )}

      {loading && !feed && (
        <ul className="signal-list signal-skeleton" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="signal-card skeleton">
              <div className="skeleton-line short" />
              <div className="skeleton-line title" />
              <div className="skeleton-line" />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="signal-empty">
          <p>No articles yet.</p>
          <p className="signal-empty-hint">
            Add RSS sources to your Google Sheet &quot;Sources&quot; tab, then refresh.
          </p>
        </div>
      )}

      {filteredItems.length > 0 && (
        <ul className="signal-list">
          {filteredItems.map((item) => {
            const isRead = readLinks.has(item.link);
            return (
              <li
                key={item.id}
                className={`signal-card ${isRead ? 'read' : ''}`}
                onClick={() => openArticle(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openArticle(item);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="signal-card-meta">
                  <span className="signal-source">{item.source}</span>
                  {item.category && (
                    <span className="signal-category">{item.category}</span>
                  )}
                  <span className="signal-time">{formatRelativeTime(item.published)}</span>
                  <button
                    type="button"
                    className="signal-mark-read"
                    onClick={(e) => toggleRead(item, e)}
                    aria-label={isRead ? 'Mark unread' : 'Mark read'}
                  >
                    {isRead ? 'Unread' : 'Read'}
                  </button>
                </div>
                <h2 className="signal-card-title">{item.title}</h2>
                {item.summary && <p className="signal-card-summary">{item.summary}</p>}
              </li>
            );
          })}
        </ul>
      )}
      </main>
    </div>
  );
};

export default SignalGarden;
