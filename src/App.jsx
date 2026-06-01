import { useState, useEffect } from 'react';
import { getParam, decodeState } from './lib/utils.js';
import SetupView     from './components/SetupView.jsx';
import SurveyView    from './components/SurveyView.jsx';
import DashboardView from './components/DashboardView.jsx';

const SESSION_KEY = 'gs_active_session';

export default function App() {
  const [mode, setMode]         = useState(null);
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    // Check if this is a survey link
    const modeParam  = getParam('mode');
    const person     = getParam('person');
    const session    = getParam('session');
    const dataParam  = getParam('data');

    if (modeParam === 'survey' && person && session && dataParam) {
      const receiptData = decodeState(dataParam);
      if (receiptData) {
        setMode('survey');
        setAppState({ receiptData, personName: person, sessionId: session });
        return;
      }
    }

    // Otherwise load dashboard or setup
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setAppState(JSON.parse(saved));
        setMode('dashboard');
      } catch {
        setMode('setup');
      }
    } else {
      setMode('setup');
    }
  }, []);

  const handleStart = ({ receiptData, people, sessionId }) => {
    const state = { receiptData, people, sessionId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    setAppState(state);
    setMode('dashboard');
  };

  const handleNewSplit = () => {
    localStorage.removeItem(SESSION_KEY);
    setAppState(null);
    setMode('setup');
  };

  if (!mode) return null; // brief flash guard

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top nav (hidden on survey pages) */}
      {mode !== 'survey' && (
        <nav style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(2,9,23,0.85)', backdropFilter: 'blur(14px)',
        }}>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 17, color: 'var(--text-1)', letterSpacing: -0.3 }}>
            🛒 GrocerySplit
          </span>
          {mode === 'dashboard' && (
            <button onClick={handleNewSplit} style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-3)', borderRadius: 'var(--radius-sm)',
              padding: '6px 14px', fontSize: 12, fontFamily: 'var(--font-mono)',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--border-mid)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >+ New split</button>
          )}
        </nav>
      )}

      {mode === 'setup'     && <SetupView onStart={handleStart} />}
      {mode === 'dashboard' && appState && (
        <DashboardView
          receiptData={appState.receiptData}
          sessionId={appState.sessionId}
          people={appState.people}
        />
      )}
      {mode === 'survey'    && appState && (
        <SurveyView
          receiptData={appState.receiptData}
          personName={appState.personName}
          sessionId={appState.sessionId}
        />
      )}
    </div>
  );
}
