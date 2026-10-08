import React, {useEffect, useRef, useState} from 'react';
import {useHomeLocale, type HomeLocale} from './useHomeLocale';
import {
  PROMO_VIDEO,
  PROMO_VIDEO_SECTION_ID,
  formatClock,
  usePromoVideoUrls,
} from './promoVideo';

const COPY: Record<
  HomeLocale,
  {
    eyebrow: string;
    note?: string;
    play: string;
    chapters: string;
  }
> = {
  zh: {
    eyebrow: '产品视频',
    play: '播放 45 秒产品视频',
    chapters: '视频章节',
  },
  en: {
    eyebrow: 'Product video',
    note: 'The UI in the video is in Chinese. English subtitles are on by default.',
    play: 'Play the 45-second product video',
    chapters: 'Video chapters',
  },
};

/** 当前播放时间所在章节；片头返回 -1。/ Chapter at the current time; -1 during the intro. */
function chapterAt(time: number): number {
  let index = -1;
  PROMO_VIDEO.chapters.forEach((chapter, i) => {
    if (time >= chapter.start) index = i;
  });
  return index;
}

/**
 * 首页产品视频区：先只加载海报，点击后才拉取视频；章节按钮可直接跳到对应功能。
 * Homepage product video: only the poster loads up front, the video is fetched on click; chapter buttons jump to each feature.
 */
export function PromoVideoSection(): React.JSX.Element {
  const locale = useHomeLocale();
  const copy = COPY[locale];
  const urls = usePromoVideoUrls();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(-1);

  // 由 video 自身事件驱动状态，首屏按钮直接调用 play() 时封面也能同步收起。
  // State follows the video's own events, so the cover also hides when the hero button calls play() directly.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const onPlay = () => setStarted(true);
    const onTime = () => setActive(chapterAt(video.currentTime));
    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTime);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTime);
    };
  }, []);

  const play = (at?: number) => {
    const video = videoRef.current;
    if (!video) return;
    if (at !== undefined) {
      // preload="none" 时元数据未就绪，等加载出时长后再跳转。
      // With preload="none" metadata is not ready yet, so seek once the duration is known.
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = at;
      else video.addEventListener('loadedmetadata', () => { video.currentTime = at; }, {once: true});
      setActive(chapterAt(at));
    }
    // play() 必须在点击回调里同步调用，否则浏览器会拦截带声音的播放。
    // play() must run synchronously in the click handler, otherwise browsers block audible playback.
    void video.play().catch(() => setStarted(true));
  };

  return (
    <section
      id={PROMO_VIDEO_SECTION_ID}
      className="stx-film"
      aria-label={copy.eyebrow}
    >
      <div className="stx-film__intro">
        <p className="stx-film__eyebrow">
          <span className="stx-film__eyebrow-mark" aria-hidden="true" />
          {copy.eyebrow}
        </p>
        {copy.note ? <p className="stx-film__note">{copy.note}</p> : null}
      </div>

      <div className="stx-film__stage">
        <div className="stx-film__player" data-promo-player>
          <video
            ref={videoRef}
            className="stx-film__video"
            width={PROMO_VIDEO.width}
            height={PROMO_VIDEO.height}
            controls={started}
            preload="none"
            playsInline
          >
            <source src={urls.webm} type='video/webm; codecs="av01.0.08M.08, opus"' />
            <source src={urls.mp4} type='video/mp4; codecs="avc1.640029, mp4a.40.2"' />
            <track
              kind="subtitles"
              srcLang="en"
              label="English"
              src={urls.subtitlesEn}
              default={locale === 'en'}
            />
          </video>

          {!started ? (
            <button
              type="button"
              className="stx-film__cover"
              onClick={() => play()}
              aria-label={copy.play}
            >
              <img
                className="stx-film__poster"
                src={urls.poster}
                alt=""
                width={PROMO_VIDEO.width}
                height={PROMO_VIDEO.height}
                loading="lazy"
                decoding="async"
              />
              <span className="stx-film__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5z" />
                </svg>
              </span>
              <span className="stx-film__duration">{formatClock(PROMO_VIDEO.duration)}</span>
            </button>
          ) : null}
        </div>

        <ol className="stx-film__chapters" aria-label={copy.chapters}>
          {PROMO_VIDEO.chapters.map((chapter, i) => (
            <li key={chapter.start}>
              <button
                type="button"
                className={`stx-film__chapter${active === i ? ' is-active' : ''}`}
                aria-current={active === i ? 'true' : undefined}
                onClick={() => play(chapter.start)}
              >
                <span className="stx-film__chapter-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="stx-film__chapter-label">{chapter[locale]}</span>
                <span className="stx-film__chapter-time">{formatClock(chapter.start)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
