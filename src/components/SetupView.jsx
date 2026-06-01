import { useState, useRef } from 'react';
import { parseReceiptWithClaude } from '../lib/api.js';
import { genId } from '../lib/utils.js';

const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-1)',
  borderRadius: 'var(--radius-md)',
  padding: '11px 14px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function SetupView({ onStart }) {
  const [step, setStep]           = useState('upload'); // upload | people
  const [receiptData, setReceipt] = useState(null);
  const [parsing, setParsing]     = useState(false);
  const [parseError, setError]    = useState(null);
  const [people, setPeople]       = useState(['Me', '', '']);
  const [sessionId]               = useState(genId);
  const [entryMode, setEntryMode] = useState('upload');
  const [manualItems, setManual]  = useState([{ name: '', price: '', emoji: '' }]);
  const [manualTax, setManualTax] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true); setError(null);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const data = await parseReceiptWithClaude(base64, file.type);
      setReceipt(data);
      setStep('people');
    } catch (err) {
      setError(err.message || 'Could not parse receipt — try a clearer photo or manual entry.');
    } finally {
      setParsing(false);
    }
  };

  const handleManualNext = () => {
    const items = manualItems
      .filter(i => i.name.trim() && i.price)
      .map(i => ({
        name: i.name.trim(),
        price: parseFloat(i.price),
        emoji: i.emoji || '🛒',
        searchQuery: i.name.trim(),
      }));
    if (!items.length) return;
    const tax   = parseFloat(manualTax) || 0;
    const total = items.reduce((s, i) => s + i.price, 0) + tax;
    setReceipt({ items, tax, total });
    setStep('people');
  };

  const handleStart = () => {
    const validPeople = people.map(p => p.trim()).filter(Boolean);
    if (validPeople.length < 2) return;
    onStart({ receiptData, people: validPeople, sessionId });
  };

  const subtotal = receiptData?.items?.reduce((s, i) => s + i.price, 0) || 0;

  /* ── Step: upload ── */
  if (step === 'upload') return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '48px 20px' }} className="animate-fadeUp">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 8 }}>
        NEW SPLIT
      </div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
        Add your receipt
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>
        AI reads items & finds product images automatically
      </p>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
        {[{ id: 'upload', label: '📷 Upload receipt' }, { id: 'manual', label: '✏️ Manual entry' }].map(m => (
          <button key={m.id} onClick={() => setEntryMode(m.id)} style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
            background: entryMode === m.id ? 'var(--bg-raised)' : 'transparent',
            color: entryMode === m.id ? 'var(--text-1)' : 'var(--text-3)',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
            boxShadow: entryMode === m.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}>{m.label}</button>
        ))}
      </div>

      {entryMode === 'upload' ? (
        <>
          <div
            onClick={() => !parsing && fileRef.current?.click()}
            style={{
              border: `2px dashed ${parsing ? 'var(--blue)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-xl)', padding: '60px 24px',
              textAlign: 'center', cursor: parsing ? 'default' : 'pointer',
              background: 'var(--bg-surface)', transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { if (!parsing) e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = parsing ? 'var(--blue)' : 'var(--border)'; }}
          >
            {parsing ? (
              <>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)', marginBottom: 6 }}>Reading your receipt…</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>AI is extracting items + assigning emojis</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 18, color: 'var(--text-1)', marginBottom: 8 }}>Upload receipt screenshot</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>JPG · PNG · PDF — from any grocery store</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          {parseError && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--red-dim)', border: '1px solid var(--red)33', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>
              {parseError}
            </div>
          )}
        </>
      ) : (
        <div>
          {manualItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={item.emoji}
                onChange={e => { const n = [...manualItems]; n[i].emoji = e.target.value; setManual(n); }}
                placeholder="🛒" style={{ ...inputStyle, width: 50, textAlign: 'center', padding: '11px 6px', flexShrink: 0 }} />
              <input value={item.name}
                onChange={e => { const n = [...manualItems]; n[i].name = e.target.value; setManual(n); }}
                placeholder="Item name" style={{ ...inputStyle, flex: 2 }} />
              <input value={item.price}
                onChange={e => { const n = [...manualItems]; n[i].price = e.target.value; setManual(n); }}
                placeholder="0.00" style={{ ...inputStyle, flex: 1 }} type="number" step="0.01" min="0" />
              {manualItems.length > 1 && (
                <button onClick={() => setManual(manualItems.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', padding: '0 10px', flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={() => setManual([...manualItems, { name: '', price: '', emoji: '' }])}
            style={{ width: '100%', background: 'none', border: '1px dashed var(--border)', color: 'var(--text-3)', borderRadius: 'var(--radius-md)', padding: '9px 0', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 14 }}>
            + Add item
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Tax $</label>
            <input value={manualTax} onChange={e => setManualTax(e.target.value)} placeholder="0.00"
              style={inputStyle} type="number" step="0.01" min="0" />
          </div>
          <button onClick={handleManualNext}
            disabled={!manualItems.some(i => i.name && i.price)}
            style={{
              width: '100%', background: 'var(--blue)', border: 'none', color: '#fff',
              borderRadius: 'var(--radius-lg)', padding: '14px 0', fontSize: 16, fontWeight: 700,
              opacity: manualItems.some(i => i.name && i.price) ? 1 : 0.4,
            }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );

  /* ── Step: people ── */
  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '48px 20px' }} className="animate-fadeUp">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, marginBottom: 8 }}>STEP 2 OF 2</div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Who's splitting?</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 28 }}>
        {receiptData?.items?.length} items · ${subtotal.toFixed(2)} + ${(receiptData?.tax || 0).toFixed(2)} tax
      </p>

      {people.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input value={p}
            onChange={e => { const n = [...people]; n[i] = e.target.value; setPeople(n); }}
            placeholder={`Person ${i + 1}`}
            style={{ ...inputStyle, borderColor: p.trim() ? 'var(--border-mid)' : 'var(--border)' }} />
          {people.length > 2 && (
            <button onClick={() => setPeople(people.filter((_, j) => j !== i))}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', padding: '0 12px', flexShrink: 0, fontSize: 16 }}>✕</button>
          )}
        </div>
      ))}

      <button onClick={() => setPeople([...people, ''])}
        style={{ width: '100%', background: 'none', border: '1px dashed var(--border)', color: 'var(--text-3)', borderRadius: 'var(--radius-md)', padding: '9px 0', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 24 }}>
        + Add person
      </button>

      <button onClick={handleStart} disabled={people.filter(p => p.trim()).length < 2}
        style={{
          width: '100%', background: 'var(--blue)', border: 'none', color: '#fff',
          borderRadius: 'var(--radius-lg)', padding: '14px 0', fontSize: 16, fontWeight: 700,
          opacity: people.filter(p => p.trim()).length < 2 ? 0.4 : 1, transition: 'opacity 0.2s',
        }}>
        Create split &amp; get links →
      </button>
    </div>
  );
}
