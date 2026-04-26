import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Music, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import GameControls from './components/GameControls';
const StaffDisplay = lazy(() => import('./components/StaffDisplay'));
import { KEYS, CLEFS, getRandomItems, KeySignature } from './utils/keys';
import { Interval, IntervalQuestion, generateInterval, getRandomIntervals } from './utils/intervals';
import { playInterval } from './utils/audio';
import './App.css';

export type QuestionType = 'keys' | 'intervals';

interface Question {
  type: QuestionType;
  key?: KeySignature;
  interval?: IntervalQuestion;
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
  const [questionType, setQuestionType] = useState<QuestionType>('keys');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<(KeySignature | Interval)[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [animateKey, setAnimateKey] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null); // { status: 'correct'|'incorrect', message: '' }
  const [soundEnabled, setSoundEnabled] = useState(true);

  const generateQuestion = useCallback(() => {
    if (activeClefs.length === 0) return;
    const randomClef = activeClefs[Math.floor(Math.random() * activeClefs.length)];

    if (questionType === 'keys') {
      let validKeys = KEYS;
      if (mode === 'major') validKeys = KEYS.filter(k => k.mode === 'major');
      if (mode === 'minor') validKeys = KEYS.filter(k => k.mode === 'minor');
      if (validKeys.length === 0) return;

      const randomKey = validKeys[Math.floor(Math.random() * validKeys.length)];
      setCurrentQuestion({ type: 'keys', key: randomKey, clef: randomClef });

      const newOptions = getRandomItems(validKeys, 3, randomKey);
      setOptions(newOptions);
    } else {
      const intervalQ = generateInterval(randomClef);
      setCurrentQuestion({ type: 'intervals', interval: intervalQ, clef: randomClef });

      const newOptions = getRandomIntervals(3, intervalQ.interval);
      setOptions(newOptions);
    }
    
    setAnimateKey(false);
    setTimeout(() => setAnimateKey(true), 50);
  }, [activeClefs, mode, questionType]);

  // Re-generate question when type changes
  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionType]);

  const toggleClef = (clefId: string) => {
    setActiveClefs(prev => {
      if (prev.includes(clefId)) {
        if (prev.length === 1) return prev; // prevent empty
        return prev.filter(c => c !== clefId);
      }
      return [...prev, clefId];
    });
  };

  const handleSelect = (option: KeySignature | Interval) => {
    if (feedback) return;
    if (!currentQuestion) return;

    let isCorrect = false;
    let correctName = '';

    if (currentQuestion.type === 'keys' && currentQuestion.key) {
      isCorrect = option.name === currentQuestion.key.name;
      correctName = currentQuestion.key.name;
    } else if (currentQuestion.type === 'intervals' && currentQuestion.interval) {
      isCorrect = option.name === currentQuestion.interval.interval.name;
      correctName = currentQuestion.interval.interval.name;
    }

    if (currentQuestion.type === 'intervals' && currentQuestion.interval && soundEnabled) {
      playInterval(currentQuestion.interval.notes);
    }

    if (isCorrect) {
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
        message: `Oops! That was ${correctName}`
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
                    vexKey={currentQuestion.key?.vexKey}
                    intervalNotes={currentQuestion.interval?.notes}
                    questionType={currentQuestion.type}
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
            questionType={questionType}
            setQuestionType={setQuestionType}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
