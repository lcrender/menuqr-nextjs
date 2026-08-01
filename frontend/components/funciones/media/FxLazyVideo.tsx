import { useEffect, useRef, useState } from 'react';

type Props = {
  /** URL del video (mp4/webm). Vacío = solo placeholder. */
  src?: string | null;
  poster?: string | null;
  title: string;
  aspect?: '16/9' | '4/3';
  className?: string;
  showControls?: boolean;
};

/**
 * Video muted, loop, lazy: solo carga cuando se acerca al viewport.
 */
export default function FxLazyVideo({
  src,
  poster,
  title,
  aspect = '16/9',
  className = '',
  showControls = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return undefined;
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
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView) return;
    const play = () => {
      void video.play().catch(() => {
        /* autoplay puede fallar; el usuario puede usar controles */
      });
    };
    play();
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`fx-video ${className}`.trim()}
      style={{ aspectRatio: aspect }}
      role="group"
      aria-label={title}
    >
      {src && inView ? (
        <video
          ref={videoRef}
          className="fx-video-el"
          muted
          loop
          playsInline
          autoPlay
          controls={showControls}
          poster={poster || undefined}
          preload="metadata"
        >
          <source src={src} />
        </video>
      ) : (
        <div className="fx-media-placeholder fx-media-placeholder--video">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" className="fx-video-poster" loading="lazy" decoding="async" />
          ) : null}
          <span className="fx-media-placeholder-label">{title}</span>
        </div>
      )}
    </div>
  );
}
