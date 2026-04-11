import React from 'react';

export default function GameControls({ 
  options, 
  onSelect, 
  clefs, 
  activeClefs, 
  toggleClef, 
  mode, 
  setMode,
  streak
}) {
  return (
    <div className="game-controls">
      
      {/* Multiple Choice Options */}
      <div className="options-grid">
        {options.map((opt, i) => (
          <button 
            key={i} 
            className="option-btn"
            onClick={() => onSelect(opt)}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="settings-panel">
        <div className="settings-group">
          <h4>Mode</h4>
          <div className="toggle-group">
            <button 
              className={`toggle-btn ${mode === 'major' ? 'active' : ''}`}
              onClick={() => setMode('major')}
            >
              Major Keys
            </button>
            <button 
              className={`toggle-btn ${mode === 'minor' ? 'active' : ''}`}
              onClick={() => setMode('minor')}
            >
              Minor Keys
            </button>
            <button 
              className={`toggle-btn ${mode === 'both' ? 'active' : ''}`}
              onClick={() => setMode('both')}
            >
              Both
            </button>
          </div>
        </div>

        <div className="settings-group">
          <h4>Clefs (ABRSM Grade 5)</h4>
          <div className="toggle-group">
            {clefs.map(c => (
              <button 
                key={c.id}
                className={`toggle-btn ${activeClefs.includes(c.id) ? 'active' : ''}`}
                onClick={() => toggleClef(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
