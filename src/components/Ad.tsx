import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-1023395020108641';

interface Props {
  slot: string;
  className?: string;
}

export function Ad({ slot, className }: Props) {
  const filled = useRef(false);

  useEffect(() => {
    if (filled.current) return;
    filled.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Ad blocker or script unavailable: the app carries on normally.
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ad ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
