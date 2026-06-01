import { useState, useEffect } from 'react';
import { fetchProductImage } from '../lib/api.js';

/** Full-bleed image for swipe card */
export function ProductImageFull({ item }) {
  const [url, setUrl]       = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoad(true); setError(false);
    fetchProductImage(item).then(u => {
      if (!cancelled) { setUrl(u); setLoad(false); }
    });
    return () => { cancelled = true; };
  }, [item.name]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 72 }}>{item.emoji || '🛒'}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 1 }}>
        finding image…
      </div>
    </div>
  );

  if (error || !url) return (
    <div style={{ fontSize: 80 }}>{item.emoji || '🛒'}</div>
  );

  return (
    <img
      src={url}
      alt={item.name}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

/** Small thumbnail for dashboard list */
export function ProductThumb({ item, size = 44 }) {
  const [url, setUrl]      = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setError]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoad(true); setError(false);
    fetchProductImage(item).then(u => {
      if (!cancelled) { setUrl(u); setLoad(false); }
    });
    return () => { cancelled = true; };
  }, [item.name]);

  const style = {
    width: size, height: size, borderRadius: 10,
    flexShrink: 0, overflow: 'hidden',
    background: 'var(--bg-raised)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--border)',
  };

  if (loading) return (
    <div className="skeleton" style={{ ...style }} />
  );

  if (error || !url) return (
    <div style={{ ...style, fontSize: size * 0.5 }}>{item.emoji || '🛒'}</div>
  );

  return (
    <div style={style}>
      <img src={url} alt={item.name} onError={() => setError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}
