import { useState } from 'react';
import SwipeCard from './SwipeCard.jsx';

const CHOICE_META = {
  share: { icon: '✓', color: 'var(--green)', label: 'sharing' },
  mine:  { icon: '↓', color: 'var(--amber)', label: 'mine' },
  skip:  { icon: '✕', color: 'var(--text-3)', label: 'skip' },
};

export default function SurveyView({ receiptData, personName, sessionId }) {
  const [current, setCurrent]   = useState(0);
  const [choices, setChoices]   = useState({});
  const [done, setDone]         = useState(false);

  const items = receiptData.items;

  const handleSwipe = (dir, item) => {
    const choice    = dir === 'right' ? 'share' : dir === 'down' ? 'mine' : 'skip';
    const newChoices = { ...choices, [item.name]: choice };
    setChoices(newChoices);

    if (current + 1 >= items.length) {
      localStorage.setItem(
        `gs_response_${sessionId}_${personName}`,
        JSON.stringify({ personName, choices: newChoices, submittedAt: Date.now() })
      );
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  /* ── Done screen ── */
  if (done) return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }} className="animate-popIn">
      <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 10 }}>All done!</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)', marginBottom: 36 }}>
        Your choices are saved. The receipt owner will see your totals.
      </p>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 14 }}>YOUR SUMMARY</div>
        {Object.entries(choices).map(([name, choice]) => {
          const m = CHOICE_META[choice];
          return (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--bg-surface)' }}>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 14, color: 'var(--text-2)' }}>{name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: m.color, background: m.color + '18', padding: '2px 10px', borderRadius: 6 }}>
                {m.icon} {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const progress = (current / items.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', minHeight: 'calc(100vh - 52px)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }} className="animate-fadeUp">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 4 }}>GROCERY SPLIT</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Hey {personName}! 👋</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>Swipe or tap each item</p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 380, height: 3, background: 'var(--bg-raised)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--blue), var(--green))', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>

      <SwipeCard item={items[current]} onSwipe={handleSwipe} index={current} total={items.length} />
    </div>
  );
}
