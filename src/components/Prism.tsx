import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FeedItem, FeedResponse } from '../types/feed';
import {
  fetchFeed,
  getCachedFeed,
  getReadLinks,
  markLinkRead,
  markLinkUnread,
} from '../lib/feedApi';
import ScrollReels from './reactbits/ScrollReels';
import {
  getStoredPrismTheme,
  prismThemeStyle,
  PRISM_THEME_GROUPS,
  setStoredPrismTheme,
  type PrismTheme,
} from '../config/prismTheme';
import '../styles/Prism.css';

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

const Prism: React.FC = () => {
  const [feed, setFeed] = useState<FeedResponse | null>(() => getCachedFeed());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [readLinks, setReadLinks] = useState<Set<string>>(() => getReadLinks());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [theme, setTheme] = useState<PrismTheme>(() => getStoredPrismTheme());

  const loadFeed = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(force);
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
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

  useEffect(() => {
    setActiveIndex(0);
  }, [category, showUnreadOnly, filteredItems.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredItems.length - 1));
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredItems.length]);

  const toggleRead = (item: FeedItem) => {
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
    if (!item.link) return;
    markLinkRead(item.link);
    setReadLinks((prev) => new Set(prev).add(item.link));
    window.open(item.link, '_blank', 'noopener,noreferrer');
  };

  const renderSlide = (item: FeedItem, index: number) => {
    const isRead = readLinks.has(item.link);
    return (
      <article className={`signal-reel-card ${isRead ? 'read' : ''}`}>
        <div className="signal-reel-glow" aria-hidden="true" />
        <div className="signal-reel-card-body">
          <div className="signal-reel-meta">
            <span className="signal-reel-source">{item.source}</span>
            {item.category && <span className="signal-reel-cat">{item.category}</span>}
            <span className="signal-reel-time">{formatRelativeTime(item.published)}</span>
          </div>
          <h2 className="signal-reel-title">{item.title}</h2>
          {item.summary && <p className="signal-reel-summary">{item.summary}</p>}
          {index < filteredItems.length - 1 && (
            <p className="signal-reel-hint">Swipe up for next</p>
          )}
        </div>
        <aside className="signal-reel-rail">
          <button
            type="button"
            className="signal-reel-rail-btn"
            onClick={() => openArticle(item)}
            aria-label="Open full article"
          >
            <span className="signal-reel-rail-icon">↗</span>
            <span className="signal-reel-rail-label">Read</span>
          </button>
          <button
            type="button"
            className="signal-reel-rail-btn"
            onClick={() => toggleRead(item)}
            aria-label={isRead ? 'Mark unread' : 'Mark read'}
          >
            <span className="signal-reel-rail-icon">{isRead ? '○' : '✓'}</span>
            <span className="signal-reel-rail-label">{isRead ? 'Unread' : 'Done'}</span>
          </button>
        </aside>
      </article>
    );
  };

  const handleThemeChange = (next: PrismTheme) => {
    setTheme(next);
    setStoredPrismTheme(next);
  };

  return (
    <div className="signal-reels" data-theme={theme} style={prismThemeStyle(theme)}>
      <div className="signal-reels-device">
        <div className="signal-reels-chrome">
          <header className="signal-reels-top">
            <Link to="/" className="signal-reels-home" aria-label="Back to home">
              ←
            </Link>
            <h1 className="signal-reels-brand">
              <span className="signal-reels-brand-text">Prism</span>
            </h1>
            <button
              type="button"
              className="signal-reels-icon-btn"
              onClick={() => loadFeed(true)}
              disabled={loading}
              aria-label="Refresh feed"
            >
              ↻
            </button>
          </header>

          <div className="signal-reels-toolbar">
            <label className="signal-reels-theme">
              <span className="signal-reels-theme-label">Theme</span>
              <select
                className="signal-reels-theme-select"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as PrismTheme)}
                aria-label="Color theme"
              >
                {PRISM_THEME_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.themes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className={`signal-reels-filters ${filtersOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="signal-reels-filter-toggle"
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
              >
                {category === 'all' ? 'All' : category}
                {showUnreadOnly ? ' · Unread' : ''} ▾
              </button>
            {filtersOpen && (
              <div className="signal-reels-filter-panel">
                <div className="signal-reels-chips" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    className={`signal-reels-chip ${category === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setCategory('all');
                      setFiltersOpen(false);
                    }}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      className={`signal-reels-chip ${category === cat ? 'active' : ''}`}
                      onClick={() => {
                        setCategory(cat);
                        setFiltersOpen(false);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <label className="signal-reels-unread">
                  <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  />
                  Unread only
                </label>
              </div>
            )}
            </div>
          </div>
        </div>

        {error && (
          <div className="signal-reels-state" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => loadFeed(true)}>
              Retry
            </button>
          </div>
        )}

        {loading && !feed && !error && (
          <div className="signal-reels-state">
            <div className="signal-reels-spinner" />
            <p>Loading your feed…</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="signal-reels-state">
            <p>No stories here.</p>
            <p className="signal-reels-muted">Add RSS rows to your Sheet or change filters.</p>
            <button type="button" onClick={() => loadFeed(true)}>
              Refresh
            </button>
          </div>
        )}

        {filteredItems.length > 0 && (
          <>
            <ScrollReels
              items={filteredItems}
              activeIndex={activeIndex}
              onIndexChange={setActiveIndex}
              getKey={(item) => item.id}
              renderSlide={renderSlide}
            />
            <div className="signal-reels-counter" aria-live="polite">
              {activeIndex + 1} / {filteredItems.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Prism;
