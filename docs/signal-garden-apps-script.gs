/**
 * Signal Garden — Google Apps Script backend
 *
 * PASTE ONCE into Code.gs only:
 * 1. Delete every other .gs file in the project (left sidebar)
 * 2. In Code.gs: Ctrl+A → Delete → paste this entire file once
 *
 * "redeclaration of const CACHE_TTL_SEC" = duplicate paste or two .gs files.
 *
 * Setup: docs/SIGNAL-GARDEN-SETUP.md
 *
 * Requires Chrome V8 runtime (Project Settings → Runtime → Chrome V8).
 */

var SIGNAL_GARDEN_CACHE_KEY = 'signal_garden_feed';
var SIGNAL_GARDEN_CACHE_TTL_SEC = 600;

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'feed';
  const callback = e && e.parameter && e.parameter.callback;
  const limits = getRequestLimits(e);
  try {
    if (action === 'sources') {
      var sources = getSources();
      if (limits.sourceLimit) {
        sources = sources.slice(0, limits.sourceLimit);
      }
      return jsonResponse({ sources: sources }, callback);
    }
    return jsonResponse(getFeed(limits), callback);
  } catch (err) {
    return jsonResponse(
      { error: String(err), items: [], fetchedAt: new Date().toISOString(), count: 0 },
      callback
    );
  }
}

/**
 * Optional query params (helpful for quota / testing):
 *   sourceLimit — max RSS URLs to fetch from the sheet (priority order)
 *   sources     — alias for sourceLimit
 *   itemLimit   — max articles in the merged feed (after sort)
 *   limit       — alias for itemLimit
 *
 * Example: .../exec?action=feed&sourceLimit=3&itemLimit=30&callback=test
 */
function getRequestLimits(e) {
  var p = (e && e.parameter) || {};
  var sourceLimit = parsePositiveInt(p.sourceLimit, 50);
  if (!sourceLimit) {
    sourceLimit = parsePositiveInt(p.sources, 50);
  }
  var itemLimit = parsePositiveInt(p.itemLimit, 500);
  if (!itemLimit) {
    itemLimit = parsePositiveInt(p.limit, 500);
  }
  return { sourceLimit: sourceLimit, itemLimit: itemLimit };
}

function parsePositiveInt(value, maxAllowed) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  var n = parseInt(String(value), 10);
  if (isNaN(n) || n < 1) {
    return null;
  }
  return Math.min(n, maxAllowed);
}

/** Plain JSON for browser URL bar; JSONP (callback=...) for the React app (avoids CORS). */
function jsonResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback && isSafeCallbackName(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function isSafeCallbackName(name) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(String(name));
}

/**
 * Run this once from the editor (Run → authorizeSetup) before deploying.
 * Completes the OAuth consent flow for Spreadsheet + external URL access.
 */
function authorizeSetup() {
  const ss = openSpreadsheet();
  const count = getSources().length;
  Logger.log('OK — spreadsheet: ' + ss.getName() + ', enabled sources: ' + count);
  return 'Authorized. Spreadsheet: ' + ss.getName() + '. Enabled sources: ' + count;
}

function openSpreadsheet() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    return active;
  }
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  throw new Error(
    'Open this project from your Sheet (Extensions → Apps Script), or set Script property SHEET_ID.'
  );
}

function getSources() {
  const sheet = openSpreadsheet().getSheetByName('Sources');
  if (!sheet) {
    throw new Error('Missing tab "Sources"');
  }
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });
  const col = function (name) {
    return headers.indexOf(name);
  };
  const enabledCol = col('enabled');
  const nameCol = col('name');
  const urlCol = col('rss_url');
  const categoryCol = col('category');
  const priorityCol = col('priority');

  const sources = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var enabled = enabledCol >= 0 ? row[enabledCol] : true;
    if (enabled === false || enabled === 'FALSE' || enabled === 'false' || enabled === 0) {
      continue;
    }
    var rssUrl = urlCol >= 0 ? String(row[urlCol] || '').trim() : '';
    if (!rssUrl) continue;
    sources.push({
      name: nameCol >= 0 ? String(row[nameCol] || 'Unknown').trim() : 'Unknown',
      rss_url: rssUrl,
      category: categoryCol >= 0 ? String(row[categoryCol] || '').trim() : '',
      priority: priorityCol >= 0 ? Number(row[priorityCol]) || 0 : 0,
    });
  }
  sources.sort(function (a, b) {
    return (b.priority || 0) - (a.priority || 0);
  });
  return sources;
}

function getFeedCacheKey(limits) {
  var key = SIGNAL_GARDEN_CACHE_KEY;
  if (limits.sourceLimit) {
    key += '_s' + limits.sourceLimit;
  }
  if (limits.itemLimit) {
    key += '_i' + limits.itemLimit;
  }
  return key;
}

function getFeed(limits) {
  limits = limits || { sourceLimit: null, itemLimit: null };
  const cache = CacheService.getScriptCache();
  var cacheKey = getFeedCacheKey(limits);
  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  var sources = getSources();
  if (limits.sourceLimit) {
    sources = sources.slice(0, limits.sourceLimit);
  }
  var items = [];
  const seen = {};

  sources.forEach(function (source) {
    try {
      const parsed = fetchFeedItems(source);
      parsed.forEach(function (item) {
        if (!item.link || seen[item.link]) return;
        seen[item.link] = true;
        items.push(item);
      });
    } catch (e) {
      // Skip broken feeds
    }
  });

  items.sort(function (a, b) {
    return new Date(b.published).getTime() - new Date(a.published).getTime();
  });

  if (limits.itemLimit) {
    items = items.slice(0, limits.itemLimit);
  }

  const result = {
    fetchedAt: new Date().toISOString(),
    count: items.length,
    items: items,
    sourceLimit: limits.sourceLimit || null,
    itemLimit: limits.itemLimit || null,
    sourcesFetched: sources.length,
  };
  cache.put(cacheKey, JSON.stringify(result), SIGNAL_GARDEN_CACHE_TTL_SEC);
  return result;
}

function fetchFeedItems(source) {
  const response = UrlFetchApp.fetch(source.rss_url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': 'SignalGarden/1.0' },
  });
  if (response.getResponseCode() >= 400) {
    throw new Error('HTTP ' + response.getResponseCode());
  }
  const xml = response.getContentText();
  const doc = XmlService.parse(xml);
  const root = doc.getRootElement();
  const rootName = root.getName().toLowerCase();

  if (rootName === 'rss' || rootName === 'rdf:rdf') {
    return parseRss2(root, source);
  }
  if (rootName === 'feed') {
    return parseAtom(root, source);
  }
  return [];
}

function parseRss2(root, source) {
  const channel = root.getChild('channel');
  if (!channel) return [];
  const items = channel.getChildren('item');
  return items.map(function (item) {
    return normalizeItem(
      {
        title: getChildText(item, 'title'),
        link: getLinkFromRssItem(item),
        summary: getChildText(item, 'description') || getChildText(item, 'content:encoded'),
        published: getChildText(item, 'pubDate') || getChildText(item, 'dc:date'),
        image: getEnclosureOrMedia(item),
      },
      source
    );
  });
}

function parseAtom(root, source) {
  const entries = root.getChildren('entry');
  return entries.map(function (entry) {
    var link = '';
    entry.getChildren('link').forEach(function (l) {
      var rel = l.getAttribute('rel');
      var href = l.getAttribute('href');
      if (href && (!rel || rel.getValue() === 'alternate')) {
        link = href.getValue();
      }
    });
    return normalizeItem(
      {
        title: getChildText(entry, 'title'),
        link: link,
        summary: getChildText(entry, 'summary') || getChildText(entry, 'content'),
        published: getChildText(entry, 'published') || getChildText(entry, 'updated'),
        image: '',
      },
      source
    );
  });
}

function getChildText(parent, name) {
  const child = parent.getChild(name);
  if (!child) return '';
  return String(child.getText() || '').trim();
}

function getLinkFromRssItem(item) {
  const link = getChildText(item, 'link');
  if (link) return link;
  const guid = item.getChild('guid');
  if (guid) {
    const isPerma = guid.getAttribute('isPermaLink');
    if (!isPerma || isPerma.getValue() !== 'false') {
      return String(guid.getText() || '').trim();
    }
  }
  return '';
}

function getEnclosureOrMedia(item) {
  var enc = item.getChild('enclosure');
  if (enc) {
    var encUrl = enc.getAttribute('url');
    if (encUrl) return encUrl.getValue();
  }
  var media = item.getChild('media:content') || item.getChild('content');
  if (media) {
    var mediaUrl = media.getAttribute('url');
    if (mediaUrl) return mediaUrl.getValue();
  }
  return '';
}

function normalizeItem(raw, source) {
  const published = raw.published ? new Date(raw.published) : new Date();
  const safeDate = isNaN(published.getTime()) ? new Date() : published;
  const link = String(raw.link || '').trim();
  const title = stripHtml(String(raw.title || 'Untitled').trim());
  const summary = stripHtml(String(raw.summary || '').trim()).slice(0, 500);

  return {
    id: link || title + safeDate.toISOString(),
    title: title,
    link: link,
    summary: summary,
    published: safeDate.toISOString(),
    source: source.name,
    category: source.category || '',
    image: String(raw.image || '').trim(),
  };
}

function stripHtml(html) {
  return html
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
