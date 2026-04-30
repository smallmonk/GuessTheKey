import { KeySignature } from '../utils/keys';
import { Interval } from '../utils/intervals';
import { TimeSignature } from '../utils/timeSignatures';
import { Ornament } from '../utils/ornaments';
import { QuestionType } from '../App';

interface Clef {
  id: string;
  label: string;
}

interface GameControlsProps {
  options: (KeySignature | Interval | TimeSignature | Ornament)[];
  onSelect: (option: KeySignature | Interval | TimeSignature | Ornament) => void;
  clefs: Clef[];
  activeClefs: string[];
  toggleClef: (clefId: string) => void;
  mode: 'major' | 'minor' | 'both';
  setMode: (mode: 'major' | 'minor' | 'both') => void;
  questionType: QuestionType;
  setQuestionType: (qt: QuestionType) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export default function GameControls({ 
  options, 
  onSelect, 
  clefs, 
  activeClefs, 
  toggleClef, 
  mode, 
  setMode,
  questionType,
  setQuestionType,
  soundEnabled,
  setSoundEnabled
}: GameControlsProps) {
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
            {'symbol' in opt && opt.symbol ? (
              <span style={{ fontSize: '1.5em', marginLeft: '0.25em', verticalAlign: 'middle' }}>
                {opt.symbol}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="settings-panel">
        <div className="settings-group">
          <h4>Question Type</h4>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${questionType === 'keys' ? 'active' : ''}`}
              onClick={() => setQuestionType('keys')}
              aria-pressed={questionType === 'keys'}
            >
              Key Signatures
            </button>
            <button
              className={`toggle-btn ${questionType === 'intervals' ? 'active' : ''}`}
              onClick={() => setQuestionType('intervals')}
              aria-pressed={questionType === 'intervals'}
            >
              Intervals
            </button>
            <button
              className={`toggle-btn ${questionType === 'timeSignatures' ? 'active' : ''}`}
              onClick={() => setQuestionType('timeSignatures')}
              aria-pressed={questionType === 'timeSignatures'}
            >
              Time Signatures
            </button>
            <button
              className={`toggle-btn ${questionType === 'ornaments' ? 'active' : ''}`}
              onClick={() => setQuestionType('ornaments')}
              aria-pressed={questionType === 'ornaments'}
            >
              Ornaments
            </button>
          </div>
        </div>

        {questionType === 'intervals' && (
          <div className="settings-group">
            <h4>Sound</h4>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
                onClick={() => setSoundEnabled(true)}
                aria-pressed={soundEnabled}
              >
                Sound: On
              </button>
              <button
                className={`toggle-btn ${!soundEnabled ? 'active' : ''}`}
                onClick={() => setSoundEnabled(false)}
                aria-pressed={!soundEnabled}
              >
                Sound: Off
              </button>
            </div>
          </div>
        )}

        {questionType === 'keys' && (
          <div className="settings-group">
            <h4>Mode</h4>
          <div className="toggle-group">
            <button 
              className={`toggle-btn ${mode === 'major' ? 'active' : ''}`}
              onClick={() => setMode('major')}
              aria-pressed={mode === 'major'}
            >
              Major Keys
            </button>
            <button 
              className={`toggle-btn ${mode === 'minor' ? 'active' : ''}`}
              onClick={() => setMode('minor')}
              aria-pressed={mode === 'minor'}
            >
              Minor Keys
            </button>
            <button 
              className={`toggle-btn ${mode === 'both' ? 'active' : ''}`}
              onClick={() => setMode('both')}
              aria-pressed={mode === 'both'}
            >
              Both
            </button>
          </div>
        </div>
        )}

        <div className="settings-group">
          <h4>Clefs (ABRSM Grade 5)</h4>
          <div className="toggle-group">
            {clefs.map(c => (
              <button 
                key={c.id}
                className={`toggle-btn ${activeClefs.includes(c.id) ? 'active' : ''}`}
                onClick={() => toggleClef(c.id)}
                aria-pressed={activeClefs.includes(c.id)}
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
