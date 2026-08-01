import { useEffect, useRef, useState } from 'react';

type Props = {
  videoId: string;
  title: string;
  poster?: string | null;
  aspect?: '16/9' | '4/3';
  className?: string;
  /** Controles de YouTube (por defecto visibles). */
  showControls?: boolean;
};

/**
 * Embed de YouTube muted + autoplay + loop.
 * Solo monta el iframe cuando el bloque se acerca al viewport.
 */
export default function FxLazyYouTube({
  videoId,
  title,
  poster,
  aspect = '16/9',
  className = '',
  showControls = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !videoId) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoId]);

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    controls: showControls ? '1' : '0',
  });

  const embedSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
  const posterSrc = poster || `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;

  return (
    <div
      ref={ref}
      className={`fx-video ${className}`.trim()}
      style={{ aspectRatio: aspect }}
      role="group"
      aria-label={title}
    >
      {inView ? (
        <iframe
          className="fx-video-el"
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="fx-media-placeholder fx-media-placeholder--video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterSrc} alt="" className="fx-video-poster" loading="lazy" decoding="async" />
          <span className="fx-media-placeholder-label">{title}</span>
        </div>
      )}
    </div>
  );
}
