import React, {useEffect, useState} from 'react';

const REPO = 'LeonYoah/stx';
const REPO_URL = `https://github.com/${REPO}`;
const API_URL = `https://api.github.com/repos/${REPO}`;
const CACHE_KEY = 'stx-github-stars';
const CACHE_MS = 60 * 60 * 1000;

type CachedStars = {count: number; at: number};

function formatStars(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : Number(k.toFixed(1))}k`;
  }
  return String(n);
}

function readCache(): number | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStars;
    if (
      typeof parsed.count !== 'number' ||
      typeof parsed.at !== 'number' ||
      Date.now() - parsed.at > CACHE_MS
    ) {
      return null;
    }
    return parsed.count;
  } catch {
    return null;
  }
}

function writeCache(count: number): void {
  try {
    const payload: CachedStars = {count, at: Date.now()};
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

function StarIcon(): React.JSX.Element {
  return (
    <svg
      className="stx-gh-star__icon"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
      />
    </svg>
  );
}

/**
 * 行业常见 GitHub Star 胶囊：Octicon 星 + Star + 可选实时计数。
 * Common Star pill: octicon + label + optional live count.
 */
export function GitHubStarButton({
  label = 'Star',
}: {
  label?: string;
}): React.JSX.Element {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache();
    if (cached !== null) {
      setStars(cached);
    }

    void fetch(API_URL, {
      headers: {Accept: 'application/vnd.github+json'},
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: {stargazers_count?: unknown}) => {
        if (cancelled || typeof data.stargazers_count !== 'number') return;
        setStars(data.stargazers_count);
        writeCache(data.stargazers_count);
      })
      .catch(() => {
        // keep cache or empty count cell
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a
      className="stx-gh-star"
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star ${REPO} on GitHub`}
    >
      <span className="stx-gh-star__action">
        <StarIcon />
        {label}
      </span>
      {stars !== null ? (
        <span className="stx-gh-star__count" aria-label={`${stars} stars`}>
          {formatStars(stars)}
        </span>
      ) : null}
    </a>
  );
}
