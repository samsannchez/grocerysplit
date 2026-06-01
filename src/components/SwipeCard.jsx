import { useState, useRef } from 'react';
import { ProductImageFull } from './ProductImage.jsx';

const ACTIONS = [
  { dir: 'left',  label: '← SKIP',  hint: 'skip',  color: 'var(--red)',   dim: 'var(--red-dim)',   badge: 'SKIP ✕',  rotate: -8 },
  { dir: 'down',  label: '↓ MINE',  hint: 'mine',  color: 'var(--amber)', dim: 'var(--amber-dim)', badge: 'MINE ↓',  rotate: 0  },
  { dir: 'right', label: 'SHARE →', hint: 'share', color: 'var(--green)', dim: 'var(--green-dim)', badge: 'SHARE ✓', rotate: 8  },
];

export default function SwipeCard({ item, onSwipe, index, total }) {
  const cardRef     = useRef(null);
  const startX      = useRef(0);
  const startY      = useRef(0);
  const dragging    = useRef(false);
  const [delta, setDelta]     = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(null);

  const getHint = () => {
    const { x, y } = delta;
    if (Math.abs(y) > Math.abs(x) && y > 40) return 'mine';
    if (x > 60)  return 'share';
    if (x < -60) return 'skip';
    return null;
  };
  const hint = leaving
    ? ACTIONS.find(a => a.dir === leaving)?.hint
    : getHint();

  const trigger = (dir) => {
    setLeaving(dir);
    setTimeout(() => onSwipe(dir, item), 320);
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    cardRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setDelta({ x: e.clientX - startX.current, y: e.clientY - startY.current });
  };
  const onPointerUp = () => {
    dragging.current = false;
    const { x, y } = delta;
    if (Math.abs(y) > Math.abs(x) && y > 80) trigger('down');
    else if (x >  100) trigger('right');
    else if (x < -100) trigger('left');
    else setDelta({ x: 0, y: 0 });
  };

  const tx   = leaving === 'left' ? -520 : leaving === 'right' ? 520 : delta.x;
  const ty   = leaving === 'down' ? 520  : delta.y * 0.2;
  const rot  = leaving ? 0 : delta.x * 0.06;
  const opac = leaving ? 0 : 1;

  const activeAction = ACTIONS.find(a => a.hint === hint);
  const borderColor  = activeAction ? activeAction.color : 'var(--border)';
  const overlayBg    = activeAction ? activeAction.dim   : 'transparent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Hint labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 380, marginBottom: 10, padding: '0 4px' }}>
        {ACTIONS.map(({ hint: h, label, color }) => (
          <span key={h} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.5,
            color: hint === h ? color : 'var(--text-3)',
            fontWeight: hint === h ? 600 : 400,
            flex: 1, textAlign: h === 'skip' ? 'left' : h === 'share' ? 'right' : 'center',
            transition: 'color 0.12s',
          }}>{label}</span>
        ))}
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: '100%', maxWidth: 380,
          background: 'var(--bg-card)',
          border: `2px solid ${borderColor}`,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          cursor: dragging.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`,
          transition: leaving
            ? 'transform 0.32s cubic-bezier(.4,0,.2,1), opacity 0.32s'
            : 'border-color 0.12s',
          opacity: opac,
          boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
          touchAction: 'none',
          position: 'relative',
        }}
      >
        {/* Color overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: overlayBg,
          pointerEvents: 'none', zIndex: 1, transition: 'background 0.12s',
        }} />

        {/* Image */}
        <div style={{
          width: '100%', height: 230,
          background: 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <ProductImageFull item={item} />

          {/* Counter pill */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(2,9,23,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20, padding: '4px 12px',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-2)', letterSpacing: 1,
          }}>{index + 1} / {total}</div>

          {/* Action badge */}
          {activeAction && (
            <div style={{
              position: 'absolute', top: 14,
              right: activeAction.hint === 'skip' ? 'auto' : 14,
              left:  activeAction.hint === 'skip' ? 14 : 'auto',
              background: activeAction.color,
              color: '#fff', borderRadius: 10, padding: '5px 14px',
              fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)',
              letterSpacing: 1, zIndex: 10,
              transform: `rotate(${activeAction.rotate}deg)`,
              boxShadow: `0 4px 20px ${activeAction.color}55`,
            }}>{activeAction.badge}</div>
          )}
        </div>

        {/* Text */}
        <div style={{ padding: '20px 24px 26px', position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: 10 }}>
            {item.name}
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 42, fontWeight: 800, color: 'var(--text-1)', letterSpacing: -1.5 }}>
            ${Number(item.price).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tap buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {[
          { label: '✕ Skip',  dir: 'left',  color: 'var(--red)',   dim: 'var(--red-dim)'   },
          { label: '↓ Mine',  dir: 'down',  color: 'var(--amber)', dim: 'var(--amber-dim)' },
          { label: '✓ Share', dir: 'right', color: 'var(--green)', dim: 'var(--green-dim)' },
        ].map(({ label, dir, color, dim }) => (
          <button key={dir} onClick={() => trigger(dir)} style={{
            background: dim, border: `1.5px solid ${color}33`,
            color, borderRadius: 'var(--radius-md)',
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-mono)', letterSpacing: 0.3,
            transition: 'background 0.15s, border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = color + 'aa'}
            onMouseLeave={e => e.currentTarget.style.borderColor = color + '33'}
          >{label}</button>
        ))}
      </div>
    </div>
  );
}
