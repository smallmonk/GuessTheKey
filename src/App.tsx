import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Music, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import GameControls from './components/GameControls';
const StaffDisplay = lazy(() => import('./components/StaffDisplay'));
import { KEYS, MAJOR_KEYS, MINOR_KEYS, CLEFS, getRandomItems, KeySignature } from './utils/keys';
import { Interval, IntervalQuestion, generateInterval, getRandomIntervals } from './utils/intervals';
import { TimeSignature, TimeSignatureQuestion, generateTimeSignatureQuestion, getRandomTimeSignatures } from './utils/timeSignatures';
import { Ornament, OrnamentQuestion, generateOrnamentQuestion, getRandomOrnaments } from './utils/ornaments';
import { Cadence, CadenceQuestion, generateCadenceQuestion, getCadenceOptions } from './utils/cadences';
import { playInterval, playScale, playOrnament, playCadence } from './utils/audio';
import { shuffle } from './utils/arrayUtils';
import './App.css';

export type QuestionType = 'keys' | 'intervals' | 'timeSignatures' | 'ornaments' | 'cadences';

interface Question {
  type: QuestionType;
  key?: KeySignature;
  interval?: IntervalQuestion;
  timeSignature?: TimeSignatureQuestion;
  ornament?: OrnamentQuestion;
  cadence?: CadenceQuestion;
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
  const [options, setOptions] = useState<(KeySignature | Interval | TimeSignature | Ornament | Cadence)[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [animateKey, setAnimateKey] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null); // { status: 'correct'|'incorrect', message: '' }
  const [soundEnabled, setSoundEnabled] = useState(true);

  const generateQuestion = useCallback(() => {
    if (activeClefs.length === 0) return;
    const randomClef = activeClefs[Math.floor(Math.random() * activeClefs.length)];

    if (questionType === 'keys') {
      let validKeys = KEYS;
      if (mode === 'major') validKeys = MAJOR_KEYS;
      if (mode === 'minor') validKeys = MINOR_KEYS;
      if (validKeys.length === 0) return;

      const randomKey = validKeys[Math.floor(Math.random() * validKeys.length)];
      setCurrentQuestion({ type: 'keys', key: randomKey, clef: randomClef });

      const newOptions = getRandomItems(validKeys, 3, randomKey);
      setOptions(newOptions);
    } else if (questionType === 'intervals') {
      const intervalQ = generateInterval(randomClef);
      setCurrentQuestion({ type: 'intervals', interval: intervalQ, clef: randomClef });

      const newOptions = getRandomIntervals(3, intervalQ.interval);
      setOptions(newOptions);
    } else if (questionType === 'timeSignatures') {
      const tsQ = generateTimeSignatureQuestion(randomClef);
      setCurrentQuestion({ type: 'timeSignatures', timeSignature: tsQ, clef: randomClef });

      const newOptions = getRandomTimeSignatures(3, tsQ.timeSignature);
      // Ensure the correct option is included and shuffle
      newOptions.push(tsQ.timeSignature);
      const allOptions = shuffle(newOptions);
      setOptions(allOptions);
    } else if (questionType === 'ornaments') {
      const ornQ = generateOrnamentQuestion(randomClef);
      setCurrentQuestion({ type: 'ornaments', ornament: ornQ, clef: randomClef });

      const newOptions = getRandomOrnaments(3, ornQ.ornament);
      newOptions.push(ornQ.ornament);
      const allOptions = shuffle(newOptions);
      setOptions(allOptions);
    } else if (questionType === 'cadences') {
      const cadQ = generateCadenceQuestion(randomClef);
      setCurrentQuestion({ type: 'cadences', cadence: cadQ, key: cadQ.key, clef: randomClef });

      const allOptions = getCadenceOptions();
      setOptions(allOptions);
    }
    
    setAnimateKey(false);
    setTimeout(() => setAnimateKey(true), 50);
  }, [activeClefs, mode, questionType]);

  // Re-generate question when type changes
  useEffect(() => {
    // We defer the generation slightly to avoid synchronous setState warnings inside the effect
    const timer = setTimeout(() => generateQuestion(), 0);
    return () => clearTimeout(timer);
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

  const handleSelect = (option: KeySignature | Interval | TimeSignature | Ornament | Cadence) => {
    if (feedback) return;
    if (!currentQuestion) return;

    let isCorrect = false;

    if (currentQuestion.type === 'keys' && currentQuestion.key) {
      isCorrect = option.name === currentQuestion.key.name;
    } else if (currentQuestion.type === 'intervals' && currentQuestion.interval) {
      isCorrect = option.name === currentQuestion.interval.interval.name;
    } else if (currentQuestion.type === 'timeSignatures' && currentQuestion.timeSignature) {
      isCorrect = option.name === currentQuestion.timeSignature.timeSignature.name;
    } else if (currentQuestion.type === 'ornaments' && currentQuestion.ornament) {
      isCorrect = option.name === currentQuestion.ornament.ornament.name;
    } else if (currentQuestion.type === 'cadences' && currentQuestion.cadence) {
      isCorrect = option.name === currentQuestion.cadence.cadence.name;
    }

    if (currentQuestion.type === 'intervals' && currentQuestion.interval && soundEnabled) {
      playInterval(currentQuestion.interval.notes);
    } else if (currentQuestion.type === 'keys' && currentQuestion.key && soundEnabled) {
      playScale(currentQuestion.key);
    } else if (currentQuestion.type === 'ornaments' && currentQuestion.ornament && soundEnabled) {
      playOrnament(currentQuestion.ornament.notes);
    } else if (currentQuestion.type === 'cadences' && currentQuestion.cadence && soundEnabled) {
      playCadence(currentQuestion.cadence.chords);
    }

    const isKeys = currentQuestion.type === 'keys';
    const isOrnament = currentQuestion.type === 'ornaments';
    const isCadence = currentQuestion.type === 'cadences';
    const soundTime = soundEnabled ? (isKeys ? 2400 : (isOrnament ? 2000 : (isCadence ? 1300 : 1000))) : 1000;

    setTotalQuestions(t => t + 1);

    if (isCorrect) {
      // Correct!
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ status: 'correct', message: 'Awesome job!' });
      setTimeout(() => {
        setFeedback(null);
        generateQuestion();
      }, soundTime);
    } else {
      // Incorrect
      setStreak(0);
      setFeedback({ 
        status: 'incorrect', 
        message: `Oops! Incorrect.`
      });
    }
  };

  const handleTryAgain = () => {
    setFeedback(null);
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    generateQuestion();
  };

  const titleMap: Record<QuestionType, string> = {
    keys: 'Guess the Key',
    intervals: 'Guess the Interval',
    timeSignatures: 'Guess the Time Signature',
    ornaments: 'Guess the Ornament',
    cadences: 'Guess the Cadence',
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        
        <header className="header">
          <div className="title-group">
            <Music className="icon bounce" size={32} aria-hidden="true" />
            <h1>{titleMap[questionType]}</h1>
          </div>
          <div className="stats-group">
            <div className="stat-badge score-badge">Score: {score}</div>
            <div className="stat-badge streak-badge">
              <Trophy size={16} aria-hidden="true" />
              Streak: {streak}
            </div>
            <div className="stat-badge total-badge">Total: {totalQuestions}</div>
          </div>
        </header>
        
        <main className="main-content">
          <div className="flashcard">
            {currentQuestion && currentQuestion.type === 'cadences' && currentQuestion.key && (
              <div className="cadence-key-prompt">
                Key: {currentQuestion.key.name}
              </div>
            )}
            {currentQuestion && (
              <div className="staff-wrapper">
                <Suspense fallback={<div>Loading staff...</div>}>
                  <StaffDisplay
                    clef={currentQuestion.clef}
                    vexKey={currentQuestion.key?.vexKey}
                    intervalNotes={currentQuestion.interval?.notes}
                    timeSignatureNotes={currentQuestion.timeSignature?.notes}
                    timeSignature={currentQuestion.timeSignature?.timeSignature}
                    ornamentNotes={currentQuestion.ornament?.notes}
                    ornamentVoiceConfig={currentQuestion.ornament?.ornament.voiceConfig}
                    cadenceChords={currentQuestion.cadence?.chords}
                    questionType={currentQuestion.type}
                    animateKey={animateKey}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Feedback Overlay inside flashcard */}
            {feedback && (
              <div
                className={`feedback-overlay ${feedback.status}`}
                role="alert"
                aria-live="assertive"
              >
                 {feedback.status === 'correct' ? <CheckCircle2 size={64} aria-hidden="true" /> : <XCircle size={64} aria-hidden="true" />}
                 <h2>{feedback.message}</h2>
                 {feedback.status === 'incorrect' && (
                   <div className="feedback-actions">
                     <button className="feedback-btn primary" onClick={handleTryAgain} autoFocus>Try Again</button>
                     <button className="feedback-btn secondary" onClick={handleNextQuestion}>Next Question</button>
                   </div>
                 )}
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
            disabled={feedback !== null}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
