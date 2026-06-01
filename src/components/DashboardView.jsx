import { useState, useEffect } from 'react';
import { encodeState, formatCurrency, PERSON_COLORS } from '../lib/utils.js';
import { ProductThumb } from './ProductImage.jsx';

export default function DashboardView({ receiptData, sessionId, people }) {
  const [responses, setResponses] = useState({});
  const [copied, setCopied]       = useState(null);

  const load = () => {
    const loaded = {};
    people.forEach(p => {
      const raw = localStorage.getItem(`gs_response_${sessionId}_${p}`);
      if (raw) { try { loaded[p] = JSON.parse(raw); } catch (_) {} }
    });
    setResponses(loaded);
  };

  useEffect(() => { load(); }, [sessionId, people]);

  const items    = receiptData.items;
  const tax      = receiptData.tax || 0;
  const subtotal = items.reduce((s, i) => s + i.price, 0);

  // ── Calculate what each person owes (pre-tax) ──
  const owes = {};
  people.forEach(p => { owes[p] = 0; });

  items.forEach(item => {
    const sharers = people.filter(p => responses[p]?.choices?.[item.name] === 'share');
    const owners  = people.filter(p => responses[p]?.choices?.[item.name] === 'mine');
    if (owners.length > 0)  owners.forEach(p  => { owes[p] += item.price / owners.length; });
    else if (sharers.length > 0) sharers.forEach(p => { owes[p] += item.price / sharers.length; });
  });

  // Distribute tax proportionally
  const totalOwed = Object.values(owes).reduce((s, v) => s + v, 0);
  const finalOwes = {};
  people.forEach(p => {
    const share = totalOwed > 0 ? owes[p] / totalOwed : 0;
    finalOwes[p] = owes[p] + tax * share;
  });

  const responded = people.filter(p => responses[p]);
  const pending   = people.filter(p => !responses[p]);

  // ── Survey link builder ──
  const baseUrl    = window.location.origin + window.location.pathname;
  const surveyLink = (person) => {
    const params = new URLSearchParams({
      mode: 'survey', person, session: sessionId,
      data: encodeState(receiptData),
    });
    return `${baseUrl}?${params}`;
  };

  const copyLink = (person) => {
    navigator.clipboard.writeText(surveyLink(person));
    setCopied(person);
    setTimeout(() => setCopied(null), 2200);
  };

  const statCard = (label, value, accent) => (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '10px 16px', minWidth: 80 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: accent || 'var(--text-1)' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px 60px' }} className="animate-fadeUp">

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2 }}>DASHBOARD</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, margin: '4px 0 14px' }}>Grocery Split</h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {statCard('Subtotal', formatCurrency(subtotal))}
          {statCard('Tax', formatCurrency(tax))}
          {statCard('Total', formatCurrency(subtotal + tax), 'var(--green)')}
          {statCard('Items', items.length)}
          {statCard('Responded', `${responded.length}/${people.length}`)}
        </div>
      </div>

      {/* ── Survey links ── */}
      <section style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 16 }}>SURVEY LINKS</div>
        {people.map((person, i) => {
          const color   = PERSON_COLORS[i % PERSON_COLORS.length];
          const hasResp = !!responses[person];
          return (
            <div key={person} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--bg-surface)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: color + '18', border: `2px solid ${hasResp ? 'var(--green)' : color + '44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color, fontFamily: 'var(--font-head)', flexShrink: 0 }}>
                {person[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 15 }}>{person}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: hasResp ? 'var(--green)' : 'var(--text-3)', marginTop: 1 }}>
                  {hasResp ? '✓ Responded' : 'Waiting…'}
                </div>
              </div>
              <button onClick={() => copyLink(person)} style={{
                background: copied === person ? 'var(--green-dim)' : 'var(--bg-surface)',
                border: `1px solid ${copied === person ? 'var(--green)' : 'var(--border)'}`,
                color: copied === person ? 'var(--green)' : 'var(--text-2)',
                borderRadius: 'var(--radius-sm)', padding: '7px 14px',
                fontSize: 12, fontFamily: 'var(--font-mono)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                {copied === person ? '✓ Copied!' : '📋 Copy link'}
              </button>
            </div>
          );
        })}
        {pending.length > 0 && (
          <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            ⏳ Still waiting on: {pending.join(', ')}
          </div>
        )}
      </section>

      {/* ── Totals ── */}
      {responded.length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 18 }} className="animate-fadeUp">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2 }}>WHAT EACH PERSON OWES</div>
            <button onClick={load} title="Refresh" style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 20, lineHeight: 1 }}>↻</button>
          </div>
          {people.map((person, i) => {
            const color   = PERSON_COLORS[i % PERSON_COLORS.length];
            const hasResp = !!responses[person];
            return (
              <div key={person} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--bg-surface)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color, fontFamily: 'var(--font-head)', flexShrink: 0 }}>
                  {person[0].toUpperCase()}
                </div>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 600, flex: 1 }}>{person}</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: hasResp ? 'var(--text-1)' : 'var(--text-3)' }}>
                  {hasResp ? formatCurrency(finalOwes[person]) : '—'}
                </span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            * Tax distributed proportionally to each person's share
          </div>
        </section>
      )}

      {/* ── Item breakdown ── */}
      {responded.length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 20 }} className="animate-fadeUp">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 16 }}>ITEM BREAKDOWN</div>
          {items.map(item => {
            const itemChoices = {};
            people.forEach(p => {
              if (responses[p]) itemChoices[p] = responses[p].choices[item.name] || 'skip';
            });
            return (
              <div key={item.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--bg-surface)' }}>
                <ProductThumb item={item} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {people.filter(p => responses[p]).map(p => {
                      const c = itemChoices[p];
                      const color = c === 'share' ? 'var(--green)' : c === 'mine' ? 'var(--amber)' : 'var(--text-3)';
                      return (
                        <span key={p} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color, background: color + '18', padding: '2px 7px', borderRadius: 5 }}>
                          {p}: {c}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', flexShrink: 0 }}>
                  {formatCurrency(item.price)}
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
