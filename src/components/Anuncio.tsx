import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-1023395020108641';

interface Props {
  slot: string;
}

export function Anuncio({ slot }: Props) {
  const preenchido = useRef(false);

  useEffect(() => {
    if (preenchido.current) return;
    preenchido.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Bloqueador de anúncio ou script fora do ar: o app segue normal.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle anuncio"
      style={{ display: 'block' }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
