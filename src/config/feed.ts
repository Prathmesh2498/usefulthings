/**
 * Apps Script echo URL (works in browser without sign-in).
 * After redeploying, open your /exec link while logged in and copy the
 * script.googleusercontent.com/macros/echo?... URL from the address bar.
 */
export const FEED_API_URL =
  process.env.REACT_APP_FEED_API_URL ||
  'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnQzZw1JgjWHZmgCnPlWnAzPko3JlTLJGKpjAMXpDuGK6XDTO-QuxLl-PuLGggfoLmhltVkMP4mX3ENtKvx6JRpROOcFCLeBmykLSrVPhlBwD8aA4RVDft_ZR-Uzd9J4JGKrbW-zkv0hmgct5I24ZhOV6UZ1DfXXLeS6p_bF_PA5up29OJMcyXsdm6ITNAuXaCFLTIEJ4MU5Tl0wiEVo1rIWvvgUAzSoWWqboP3HlF87LplbJSmaxsIB0Sk2YTW_k385GFSodS1A4rz4VwgQP8-0duQBFA&lib=MZmcgv3v8LLgmy4fdtSJpf4-j65xsSpaE';

export const CACHE_TTL_MS = 10 * 60 * 1000;
export const READ_LINKS_KEY = 'signal_garden_read_links';
