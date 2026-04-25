import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Music, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import GameControls from './components/GameControls';
const StaffDisplay = lazy(() => import('./components/StaffDisplay'));
import { KEYS, CLEFS, getRandomItems, KeySignature } from './utils/keys';
import './App.css';

interface Question {
  key: KeySignature;
  clef: string;
}

interface Feedback {
  status: 'correct' | 'incorrect';
  message: string;
}

type Mode = 'major' | 'minor' | 'both';

function App() {
  const [activeClefs, setActiveClefs] = useState<string[]>(['treble', 'bass']);
  const [mode, setMode] = useState<Mode>('both'); // 'major', 'minor', 'both'
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<KeySignature[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [animateKey, setAnimateKey] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null); // { status: 'correct'|'incorrect', message: '' }

  const generateQuestion = useCallback(() => {
    // Filter keys by mode
    let validKeys = KEYS;
    if (mode === 'major') validKeys = KEYS.filter(k => k.mode === 'major');
    if (mode === 'minor') validKeys = KEYS.filter(k => k.mode === 'minor');

    if (validKeys.length === 0 || activeClefs.length === 0) return;

    // Pick random key and clef
    const randomKey = validKeys[Math.floor(Math.random() * validKeys.length)];
    const randomClef = activeClefs[Math.floor(Math.random() * activeClefs.length)];

    setCurrentQuestion({ key: randomKey, clef: randomClef });
    
    // Generate options including the correct one
    const newOptions = getRandomItems(validKeys, 3, randomKey);
    setOptions(newOptions);
    
    // Trigger animation
    setAnimateKey(false);
    setTimeout(() => setAnimateKey(true), 50);
  }, [activeClefs, mode]);

  // Initial load
  useEffect(() => {
    // We only want to generate a question on mount if one doesn't exist
    // However, since `generateQuestion` uses state, we can ignore the exhaustive-deps or set-state-in-effect warning here
    // as it is an explicit intentional action.
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleClef = (clefId: string) => {
    setActiveClefs(prev => {
      if (prev.includes(clefId)) {
        if (prev.length === 1) return prev; // prevent empty
        return prev.filter(c => c !== clefId);
      }
      return [...prev, clefId];
    });
  };

  const handleSelect = (option: KeySignature) => {
    if (feedback) return; // prevent clicking while showing feedback
    if (!currentQuestion) return;

    if (option.name === currentQuestion.key.name) {
      // Correct!
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ status: 'correct', message: 'Awesome job!' });
      setTimeout(() => {
        setFeedback(null);
        generateQuestion();
      }, 1000);
    } else {
      // Incorrect
      setStreak(0);
      setFeedback({ 
        status: 'incorrect', 
        message: `Oops! That was ${currentQuestion.key.name}` 
      });
      setTimeout(() => {
        setFeedback(null);
        generateQuestion();
      }, 2500);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        
        <header className="header">
          <div className="title-group">
            <Music className="icon bounce" size={32} />
            <h1>Guess the Key</h1>
          </div>
          <div className="stats-group">
            <div className="stat-badge score-badge">Score: {score}</div>
            <div className="stat-badge streak-badge">
              <Trophy size={16} /> 
              Streak: {streak}
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <div className="flashcard">
            {currentQuestion && (
              <div className="staff-wrapper">
                <Suspense fallback={<div>Loading staff...</div>}>
                  <StaffDisplay
                    clef={currentQuestion.clef}
                    vexKey={currentQuestion.key.vexKey}
                    animateKey={animateKey}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Feedback Overlay inside flashcard */}
            {feedback && (
              <div className={`feedback-overlay ${feedback.status}`}>
                 {feedback.status === 'correct' ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
                 <h2>{feedback.message}</h2>
              </div>
            )}
          </div>
          
          <GameControls 
            options={options}
            onSelect={handleSelect}
            clefs={CLEFS}
            activeClefs={activeClefs}
            toggleClef={toggleClef}
            mode={mode}
            setMode={setMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
