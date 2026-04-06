import React, { useState } from 'react';
import { Plus, Check, ChevronRight, CheckCircle, Circle, Play, Edit3, ArrowDown, ArrowUp, Minus, X, BarChart2, Clock, Zap, Flame } from 'lucide-react';
import type { MuscleCategory, Muscle, Exercise, WorkoutSession, UserProfile as UserProfileType } from '../types';
import type { AppUser } from '../store/useStore';
import { mockExercises } from '../store/mockData';

type PlannedSet = { reps: number; weight: number };
type ActualSet = { reps: number; weight: number; done: boolean };
type LoggedExercise = {
  exercise: Exercise;
  plannedSets: PlannedSet[];
  actualSets: ActualSet[];
  restTime: number;
  caloriesManual?: number;
  validated: boolean;
};

type SessionPhase = 'naming' | 'planning' | 'realisation' | 'summary';

interface WorkoutLoggerProps {
  currentUser?: UserProfileType;
  appUser?: AppUser;
  onSaveWorkout?: (session: WorkoutSession) => void;
}

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ currentUser, appUser, onSaveWorkout }) => {
  const [phase, setPhase] = useState<SessionPhase>('naming');
  const [sessionName, setSessionName] = useState('');

  // Planning wizard
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<MuscleCategory | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [planningSets, setPlanningSets] = useState([{ reps: 10, weight: 20 }]);
  const [wizardRestTime, setWizardRestTime] = useState(60);

  const [shameMode, setShameMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [activeTimerExIdx, setActiveTimerExIdx] = useState<number | null>(null);
  const [showShameAlert, setShowShameAlert] = useState(false);
  const [pendingCalorieExIdx, setPendingCalorieExIdx] = useState<number | null>(null);

  // Helper to get last max
  const getLastMax = (exerciseId: string) => {
    let maxW = 0;
    let maxR = 0;
    const history = appUser?.history || [];
    history.forEach(s => {
      s.exercises.forEach(ex => {
        if (ex.exercise.id === exerciseId) {
          ex.sets.forEach(set => {
            if (set.weight > maxW) {
              maxW = set.weight;
              maxR = set.reps;
            } else if (set.weight === maxW && set.reps > maxR) {
              maxR = set.reps;
            }
          });
        }
      });
    });
    return maxW > 0 ? `${maxW}kg × ${maxR}` : 'Premier essai !';
  };

  // Exercises
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);

  // Currently editing exercise index during realisation
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // ---- Naming ----
  const handleStartPlanning = () => {
    if (sessionName.trim() === '') return;
    setPhase('planning');
  };

  // ---- Planning wizard ----
  const handleCategorySelect = (cat: MuscleCategory) => {
    setCategory(cat);
    setMuscle(null);
    setExercise(null);
    setWizardStep(2);
  };
  const handleMuscleSelect = (m: Muscle) => {
    setMuscle(m);
    setExercise(null);
    setWizardStep(3);
  };
  const handleExerciseSelect = (ex: Exercise) => {
    setExercise(ex);
    setPlanningSets([{ reps: 10, weight: 20 }]);
    setWizardStep(4);
  };
  const addPlanningSet = () => {
    setPlanningSets([...planningSets, { reps: 10, weight: 20 }]);
  };
  const updatePlanningSet = (idx: number, field: 'reps' | 'weight', value: number) => {
    const next = [...planningSets];
    next[idx][field] = value;
    setPlanningSets(next);
  };
  const removePlanningSet = (idx: number) => {
    if (planningSets.length <= 1) return;
    setPlanningSets(planningSets.filter((_, i) => i !== idx));
  };
  const savePlannedExercise = () => {
    if (!exercise) return;
    const planned: LoggedExercise = {
      exercise,
      plannedSets: planningSets.map(s => ({ ...s })),
      actualSets: planningSets.map(s => ({ reps: s.reps, weight: s.weight, done: false })),
      restTime: wizardRestTime,
      validated: false,
    };
    setExercises([...exercises, planned]);
    resetWizard();
  };
  const resetWizard = () => {
    setWizardStep(1);
    setCategory(null);
    setMuscle(null);
    setExercise(null);
    setPlanningSets([{ reps: 10, weight: 20 }]);
    setWizardRestTime(60);
  };
  const removePlannedExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  // ---- Start realisation ----
  const startRealisation = () => {
    if (exercises.length === 0) return;
    setPhase('realisation');
  };

  // ---- Realisation ----
  const updateActualSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    const next = [...exercises];
    next[exIdx].actualSets[setIdx][field] = value;
    setExercises(next);
  };
  const toggleSetDone = (exIdx: number, setIdx: number) => {
    const next = [...exercises];
    const isDone = !next[exIdx].actualSets[setIdx].done;
    next[exIdx].actualSets[setIdx].done = isDone;
    setExercises(next);

    // If marked as done, start the rest timer
    if (isDone) {
      startRestTimer(next[exIdx].restTime, exIdx);
    }
  };

  const startRestTimer = (seconds: number, exIdx: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
    setActiveTimerExIdx(exIdx);
    setShowShameAlert(false);
  };

  React.useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);

      // If it was a cardio exercise, ask for calories after the rest timer
      if (activeTimerExIdx !== null && exercises[activeTimerExIdx]) {
        const ex = exercises[activeTimerExIdx];
        if (ex.exercise.category === 'Cardio') {
          setPendingCalorieExIdx(activeTimerExIdx);
        }
      }

      if (shameMode) {
        setShowShameAlert(true);
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, shameMode]);
  const addActualSet = (exIdx: number) => {
    const next = [...exercises];
    const lastSet = next[exIdx].actualSets[next[exIdx].actualSets.length - 1];
    next[exIdx].actualSets.push({
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 20,
      done: false
    });
    setExercises(next);
  };
  const removeActualSet = (exIdx: number, setIdx: number) => {
    const next = [...exercises];
    if (next[exIdx].actualSets.length <= 1) return;
    next[exIdx].actualSets = next[exIdx].actualSets.filter((_, i) => i !== setIdx);
    setExercises(next);
  };
  const validateExercise = (exIdx: number) => {
    const next = [...exercises];
    next[exIdx].validated = !next[exIdx].validated;
    if (next[exIdx].validated) {
      setEditingIndex(null);
      // Also start a rest timer between exercises
      startRestTimer(next[exIdx].restTime, exIdx);
    }
    setExercises(next);
  };

  const allValidated = exercises.length > 0 && exercises.every(e => e.validated);

  const finishWorkout = () => {
    setPhase('summary');
  };

  const resetAll = () => {
    // Before resetting, save to store if possible
    if (onSaveWorkout && sessionName.trim() !== '' && exercises.length > 0) {
      const session: WorkoutSession = {
        id: `sess-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
        name: sessionName,
        durationMinutes: 45, // Hardcoded for now
        exercises: exercises.map((ex, i) => ({
          id: `ex-${Date.now()}-${i}`,
          exercise: ex.exercise,
          validated: ex.validated,
          calories: ex.caloriesManual,
          sets: ex.actualSets.map((s, si) => ({
            id: `s-${Date.now()}-${i}-${si}`,
            reps: s.reps,
            weight: s.weight,
            completed: s.done
          }))
        }))
      };
      onSaveWorkout(session);
    }

    setPhase('naming');
    setSessionName('');
    setExercises([]);
    resetWizard();
    setEditingIndex(null);
  };

  // ---- Diff helpers ----
  const diffValue = (planned: number, actual: number) => actual - planned;
  const diffColor = (diff: number) => diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--text-muted)';
  const diffIcon = (diff: number) => diff > 0 ? <ArrowUp size={12} /> : diff < 0 ? <ArrowDown size={12} /> : <Minus size={10} />;
  const diffLabel = (diff: number, unit: string) => {
    if (diff === 0) return '=';
    return `${diff > 0 ? '+' : ''}${diff}${unit}`;
  };

  // ========== NAMING PHASE ==========
  if (phase === 'naming') {
    return (
      <div className="flex-col gap-6 w-full">
        <h2 className="text-gradient" style={{ fontSize: '1.8rem', textAlign: 'center' }}>Nouvelle Séance</h2>
        <div className="glass-card flex-col gap-4" style={{ padding: '2rem' }}>
          <label style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Donne un nom à ta séance
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Ex : Push Day, Jour Jambes, Full Body..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleStartPlanning(); }}
            style={{
              width: '100%', padding: '1rem',
              background: 'rgba(255, 192, 203, 0.15)',
              border: '2px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-main)', fontSize: '1.1rem',
              outline: 'none',
            }}
          />
          <button
            className="btn-primary mt-2 flex justify-center gap-2 items-center"
            onClick={handleStartPlanning}
            style={{ opacity: sessionName.trim() === '' ? 0.5 : 1, pointerEvents: sessionName.trim() === '' ? 'none' : 'auto' }}
          >
            <ChevronRight size={18} /> Planifier la Séance
          </button>
        </div>
      </div>
    );
  }

  // ========== PLANNING PHASE ==========
  if (phase === 'planning') {
    return (
      <div className="flex-col gap-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex-col">
            <h2 className="text-gradient" style={{ fontSize: '1.5rem' }}>📝 {sessionName}</h2>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{currentUser?.name} — {exercises.length} exercice(s) prévu(s)</span>
          </div>
          {exercises.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 glass-card" style={{ padding: '0.4rem 0.8rem', background: shameMode ? 'rgba(255, 20, 147, 0.1)' : 'rgba(255, 255, 255, 0.05)', borderColor: shameMode ? 'var(--danger)' : 'var(--border-glass)' }}>
                <Zap size={16} color={shameMode ? 'var(--danger)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mode Honte</span>
                <button
                  onClick={() => setShameMode(!shameMode)}
                  style={{
                    width: '30px', height: '15px', borderRadius: '15px',
                    background: shameMode ? 'var(--danger)' : 'var(--text-muted)',
                    position: 'relative', border: 'none', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '11px', height: '11px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: shameMode ? '17px' : '2px',
                  }} />
                </button>
              </div>
              <button
                onClick={startRealisation}
                className="btn-primary flex items-center gap-2"
                style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}
              >
                <Play size={16} /> Go !
              </button>
            </div>
          )}
        </div>

        {/* Listed planned exercises */}
        {exercises.length > 0 && (
          <div className="flex-col gap-3">
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Exercices Prévus</h4>
            {exercises.map((ex, idx) => (
              <div key={idx} className="glass-card flex items-center justify-between" style={{ padding: '1rem' }}>
                <div className="flex-col gap-1">
                  <div style={{ fontWeight: 600 }}>{ex.exercise.name}</div>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {ex.plannedSets.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: '#fff', borderRadius: '4px', fontFamily: 'var(--font-heading)' }}>
                        {s.weight}kg × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => removePlannedExercise(idx)} style={{ color: 'var(--danger)', padding: '0.25rem' }}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Exercise wizard */}
        {wizardStep === 1 && (
          <div className="flex-col gap-4">
            <h3 style={{ fontSize: '1.1rem' }}>Ajouter un Exercice</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button className="glass-card flex-col items-center justify-center gap-2" style={{ flex: '1 0 100px', padding: '2rem 1rem' }}
                onClick={() => handleCategorySelect('Haut du Corps')}>
                <div style={{ fontSize: '2rem' }}>💪</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Haut du Corps</div>
              </button>
              <button className="glass-card flex-col items-center justify-center gap-2" style={{ flex: '1 0 100px', padding: '2rem 1rem' }}
                onClick={() => handleCategorySelect('Bas du Corps')}>
                <div style={{ fontSize: '2rem' }}>🦵</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Bas du Corps</div>
              </button>
              <button className="glass-card flex-col items-center justify-center gap-2" style={{ flex: '1 0 100px', padding: '2rem 1rem' }}
                onClick={() => handleCategorySelect('Cardio')}>
                <div style={{ fontSize: '2rem' }}>🏃‍♀️</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>Cardio / HIIT</div>
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && category && (
          <div className="flex-col gap-4">
            <div className="flex items-center gap-2" onClick={() => setWizardStep(1)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> <span>Retour aux Catégories</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>{category === 'Cardio' ? 'Choisir le Type de Sport' : 'Choisir un Muscle'}</h3>
            <div className="flex-col gap-2">
              {Array.from(new Set(mockExercises.filter(e => e.category === category).map(e => e.muscle))).map(m => (
                <button key={m} className="glass-card flex items-center justify-between"
                  onClick={() => handleMuscleSelect(m as Muscle)}
                  style={{ padding: '1rem', width: '100%', textAlign: 'left' }}>
                  <span>{m}</span><ChevronRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {wizardStep === 3 && muscle && (
          <div className="flex-col gap-4">
            <div className="flex items-center gap-2" onClick={() => setWizardStep(2)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> <span>Retour aux {category === 'Cardio' ? 'Sports' : 'Muscles'}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Choisir un Exercice</h3>
            <div className="flex-col gap-2">
              {mockExercises.filter(e => e.muscle === muscle).map(ex => (
                <button key={ex.id} className="glass-card flex items-center justify-between"
                  onClick={() => handleExerciseSelect(ex)}
                  style={{ padding: '1rem', width: '100%', textAlign: 'left' }}>
                  <span>{ex.name}</span><Plus size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {wizardStep === 4 && exercise && (
          <div className="flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" onClick={() => setWizardStep(3)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> <span>Retour</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{exercise.name}</h3>
            </div>
            <div className="glass-card flex-col gap-4" style={{
              background: exercise.category === 'Cardio' ? 'linear-gradient(135deg, #fff 0%, rgba(255, 192, 203, 0.2) 100%)' : undefined,
              borderColor: exercise.category === 'Cardio' ? 'var(--primary)' : undefined,
              borderWidth: exercise.category === 'Cardio' ? '2px' : '1px'
            }}>
              {exercise.category === 'Cardio' ? (
                <div className="flex-col gap-4">
                  <div className="flex items-center gap-3 p-4" style={{ background: 'rgba(255, 105, 180, 0.1)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <div className="btn-icon" style={{ background: 'var(--primary)', color: '#fff' }}>
                      <Clock size={20} />
                    </div>
                    <div className="flex-col" style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Objectif de Durée</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={planningSets[0].weight}
                          onChange={(e) => updatePlanningSet(0, 'weight', Number(e.target.value))}
                          style={{ ...inputStyle, width: '100px', fontSize: '1.2rem', padding: '0.5rem' }}
                        />
                        <span style={{ fontWeight: 700 }}>min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-muted" style={{ padding: '0 0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ flex: 0.5, textAlign: 'center' }}>Série</span>
                    <span style={{ flex: 2, textAlign: 'center' }}>Poids (kg)</span>
                    <span style={{ flex: 2, textAlign: 'center' }}>Reps</span>
                    <span style={{ flex: 0.5 }}></span>
                  </div>
                  {planningSets.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div style={{ flex: 0.5, textAlign: 'center', fontWeight: 600 }}>{i + 1}</div>
                      <div style={{ flex: 2 }}>
                        <input type="number" value={s.weight} onChange={(e) => updatePlanningSet(i, 'weight', Number(e.target.value))}
                          style={inputStyle} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="number" value={s.reps} onChange={(e) => updatePlanningSet(i, 'reps', Number(e.target.value))}
                          style={inputStyle} />
                      </div>
                      <button onClick={() => removePlanningSet(i)} style={{ flex: 0.5, color: 'var(--danger)', display: 'flex', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-secondary mt-2 flex justify-center gap-2 items-center" onClick={addPlanningSet}>
                    <Plus size={16} /> Ajouter une Série
                  </button>
                </>
              )}

              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px dashed var(--border-glass)' }}>
                <div className="flex items-center gap-2 text-muted">
                  <Clock size={16} /> <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Repos après cet exercice</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={wizardRestTime} onChange={(e) => setWizardRestTime(Number(e.target.value))}
                    style={{ ...inputStyle, width: '80px', fontSize: '1rem', padding: '0.3rem' }} />
                  <span style={{ fontSize: '0.9rem' }}>sec</span>
                </div>
              </div>

              <button className="btn-primary mt-2 flex justify-center gap-2 items-center" onClick={savePlannedExercise}>
                <Check size={18} /> Ajouter à la séance
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== REALISATION PHASE ==========
  if (phase === 'realisation') {
    const validatedCount = exercises.filter(e => e.validated).length;
    return (
      <div className="flex-col gap-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex-col">
            <h2 className="text-gradient" style={{ fontSize: '1.5rem' }}>🏋️ {sessionName}</h2>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              En cours — {validatedCount}/{exercises.length} validé(s)
            </span>
          </div>
          {allValidated && (
            <button onClick={finishWorkout} className="btn-icon"
              style={{ background: 'var(--success)', color: '#fff', borderColor: '#2E8B57', boxShadow: '2px 2px 0px #2E8B57' }}>
              <BarChart2 size={18} />
            </button>
          )}
        </div>

        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Modifie les valeurs si nécessaire, puis valide chaque exercice ✓
        </p>

        {/* Per-exercise cards */}

        {exercises.map((ex, exIdx) => {
          const isEditing = editingIndex === exIdx;
          const isValidated = ex.validated;
          return (
            <div key={exIdx} className="glass-card flex-col gap-3" style={{
              borderColor: isValidated ? 'var(--success)' : isEditing ? 'var(--primary)' : 'var(--border-glass)',
              background: ex.exercise.category === 'Cardio' ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 182, 193, 0.1) 100%)' : undefined,
              borderWidth: ex.exercise.category === 'Cardio' && isEditing ? '3px' : '2px',
              transition: 'all 0.3s',
              opacity: isValidated ? 0.85 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {ex.exercise.category === 'Cardio' && (
                <div style={{ position: 'absolute', top: '5px', right: '-25px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', fontWeight: 900, padding: '4px 30px', transform: 'rotate(45deg)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 1, letterSpacing: '1px' }}>
                  QUEST
                </div>
              )}
              {/* Exercise header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => validateExercise(exIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {isValidated ? <CheckCircle size={24} color="var(--success)" strokeWidth={2.5} /> : <Circle size={24} color="var(--text-muted)" />}
                  </button>
                  <div style={{ fontWeight: 600, textDecoration: isValidated ? 'line-through' : 'none', color: isValidated ? 'var(--success)' : 'var(--text-main)' }}>
                    {ex.exercise.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isValidated && (
                    <button onClick={() => setEditingIndex(isEditing ? null : exIdx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isEditing ? 'var(--primary)' : 'var(--text-muted)' }}>
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Planned overview & Last Max */}
              <div className="flex flex-wrap items-center gap-4" style={{ fontSize: '0.8rem', marginLeft: '2rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  Prévu : {ex.plannedSets.map((s) => `${s.weight}kg×${s.reps}`).join(' | ')}
                </div>
                <div style={{ background: 'rgba(255, 192, 203, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)', color: 'var(--primary)', fontWeight: 600 }}>
                  🏆 Dernier Max : {getLastMax(ex.exercise.id)}
                </div>
              </div>

              {/* Editing actual sets */}
              {isEditing && !isValidated && (
                <div className="flex-col gap-2" style={{ marginLeft: '0.5rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(255, 192, 203, 0.08)', borderRadius: 'var(--radius-sm)' }}>
                  {ex.exercise.category === 'Cardio' ? (
                    <div className="flex-col gap-4 p-4 mt-2" style={{ background: 'rgba(255, 255, 255, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="btn-icon" style={{ background: 'var(--primary)', color: '#fff', width: '40px', height: '40px' }}>
                          <Clock size={20} />
                        </div>
                        <div className="flex-col" style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>Objectif de Course</span>
                          <div className="flex items-center gap-2">
                            <input type="number"
                              value={ex.actualSets[0].weight}
                              onChange={(e) => updateActualSet(exIdx, 0, 'weight', Number(e.target.value))}
                              style={{ ...inputStyleSmall, fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', width: '80px' }} />
                            <span style={{ fontWeight: 700 }}>minutes</span>
                          </div>
                        </div>
                      </div>

                      {/* Decorative Progress Path */}
                      <div className="flex items-center gap-2 py-2" style={{ position: 'relative' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                        <div style={{ height: '2px', flex: 1, background: 'repeating-linear-gradient(90deg, var(--primary), var(--primary) 5px, transparent 5px, transparent 10px)' }} />
                        <Flame size={16} color="var(--primary)" style={{ animation: 'bounce 1s infinite' }} />
                        <div style={{ height: '2px', flex: 1, background: 'var(--border-glass)' }} />
                        <div style={{ width: '10px', height: '10px', background: 'var(--success)', transform: 'rotate(45deg)' }} />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => toggleSetDone(exIdx, 0)}
                          className="btn-primary flex items-center gap-2"
                          style={{
                            background: ex.actualSets[0].done ? 'var(--success)' : 'var(--primary)',
                            borderColor: ex.actualSets[0].done ? '#2E8B57' : undefined,
                            padding: '0.8rem 1.5rem',
                            flex: 1
                          }}>
                          {ex.actualSets[0].done ? <CheckCircle size={20} /> : <Play size={20} />}
                          <span style={{ fontWeight: 800 }}>{ex.actualSets[0].done ? 'MISSION ACCOMPLIE !' : 'LANCER LA QUÊTE'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-muted" style={{ fontSize: '0.8rem', padding: '0 0.5rem' }}>
                        <span style={{ flex: 0.5, textAlign: 'center' }}>#</span>
                        <span style={{ flex: 2, textAlign: 'center' }}>Poids (kg)</span>
                        <span style={{ flex: 2, textAlign: 'center' }}>Reps</span>
                        <span style={{ flex: 0.8, textAlign: 'center' }}>Fait</span>
                        <span style={{ flex: 0.5 }}></span>
                      </div>
                      {ex.actualSets.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <div style={{ flex: 0.5, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{sIdx + 1}</div>
                          <div style={{ flex: 2 }}>
                            <input type="number" value={s.weight} onChange={(e) => updateActualSet(exIdx, sIdx, 'weight', Number(e.target.value))}
                              style={inputStyleSmall} />
                          </div>
                          <div style={{ flex: 2 }}>
                            <input type="number" value={s.reps} onChange={(e) => updateActualSet(exIdx, sIdx, 'reps', Number(e.target.value))}
                              style={inputStyleSmall} />
                          </div>
                          <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => toggleSetDone(exIdx, sIdx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                              {s.done ? <CheckCircle size={20} color="var(--success)" /> : <Circle size={20} color="var(--text-muted)" />}
                            </button>
                          </div>
                          <button onClick={() => removeActualSet(exIdx, sIdx)} style={{ flex: 0.5, color: 'var(--danger)', display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button className="btn-secondary flex justify-center gap-2 items-center"
                        onClick={() => addActualSet(exIdx)}
                        style={{
                          padding: '0.6rem',
                          fontSize: '0.95rem',
                          marginTop: '0.5rem',
                          background: 'rgba(255, 105, 180, 0.1)',
                          borderColor: 'var(--primary)',
                          borderStyle: 'dashed',
                          width: '100%'
                        }}>
                        <Plus size={16} /> Série Supplémentaire
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Quick view actual sets when not editing */}
              {!isEditing && (
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginLeft: '2rem' }}>
                  {ex.exercise.category === 'Cardio' ? (
                    <div className="flex items-center gap-3" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>
                      <div className="flex items-center gap-1" style={{ background: 'rgba(255, 105, 180, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <Clock size={14} strokeWidth={3} /> <span>{ex.actualSets[0].weight} min</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ background: 'rgba(255, 105, 180, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                        <Flame size={14} strokeWidth={3} /> <span>{ex.caloriesManual || 0} kcal</span>
                      </div>
                    </div>
                  ) : (
                    ex.actualSets.map((s, i) => (
                      <span key={i} style={{
                        fontSize: '0.8rem', padding: '0.2rem 0.5rem',
                        background: s.done ? 'var(--success)' : isValidated ? 'var(--success)' : 'var(--primary)',
                        color: '#fff', borderRadius: '4px',
                        fontFamily: 'var(--font-heading)',
                        opacity: s.done || isValidated ? 1 : 0.6,
                      }}>
                        {s.weight}kg × {s.reps}
                      </span>
                    ))
                  )}
                </div>
              )}

              {/* Local Recovery Timer for this exercise */}
              {timerActive && activeTimerExIdx === exIdx && (
                <div className="flex items-center justify-between p-3 mt-2"
                  style={{
                    background: 'var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    animation: 'pulse 2s infinite'
                  }}>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span style={{ fontWeight: 700 }}>Récupération : {timeLeft}s</span>
                  </div>
                  <button onClick={() => setTimerActive(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Local Shame Alert */}
              {showShameAlert && activeTimerExIdx === exIdx && (
                <div className="flex-col items-center gap-2 p-4 mt-2"
                  style={{
                    background: 'var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    border: '2px dashed #fff',
                    textAlign: 'center'
                  }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>ALERTE HONTEUSE ! 🚨</div>
                  <button className="btn-secondary" onClick={() => setShowShameAlert(false)}
                    style={{ background: '#fff', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem' }}>
                    J'Y VAIS ! 🏃‍♀️
                  </button>
                </div>
              )}

              {/* Manual Calorie Input for Cardio */}
              {pendingCalorieExIdx === exIdx && (
                <div className="flex-col gap-3 p-4 mt-2 glass-card"
                  style={{
                    background: 'rgba(255, 105, 180, 0.2)',
                    borderColor: 'var(--primary)',
                    borderWidth: '2px',
                    animation: 'pulse 2s infinite'
                  }}>
                  <div className="flex items-center gap-2">
                    <Flame size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      Étape Finale : Combien de calories as-tu brûlées ?
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Ex: 150..."
                      value={ex.caloriesManual || ''}
                      onChange={(e) => {
                        const next = [...exercises];
                        next[exIdx].caloriesManual = Number(e.target.value);
                        setExercises(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setPendingCalorieExIdx(null);
                          if (!isValidated) validateExercise(exIdx);
                        }
                      }}
                      autoFocus
                      style={{
                        ...inputStyleSmall,
                        flex: 1,
                        fontSize: '1rem',
                        padding: '0.6rem',
                        background: '#fff'
                      }}
                    />
                    <button
                      className="btn-primary"
                      style={{ padding: '0 1rem' }}
                      onClick={() => {
                        setPendingCalorieExIdx(null);
                        if (!isValidated) validateExercise(exIdx);
                      }}
                    >
                      Valider ✓
                    </button>
                  </div>
                </div>
              )}

              {isValidated && (
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginLeft: '2rem' }}>
                  ✓ Exercice validé
                </div>
              )}
            </div>
          );
        })}

        {allValidated && (
          <div className="glass-card flex-col items-center gap-2" style={{ background: 'rgba(50, 205, 50, 0.08)', borderColor: 'var(--success)', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>Tous les exercices sont validés !</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>Voir le résumé de ta séance</div>
            <button className="btn-primary mt-2 flex justify-center gap-2 items-center" onClick={finishWorkout}
              style={{ background: 'var(--success)', borderColor: '#2E8B57', boxShadow: '4px 4px 0px #2E8B57' }}>
              <BarChart2 size={18} /> Voir le Résumé
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========== SUMMARY PHASE ==========
  if (phase === 'summary') {
    // Compute global stats
    let totalPlannedVolume = 0;
    let totalActualVolume = 0;
    let totalPlannedReps = 0;
    let totalActualReps = 0;

    exercises.forEach(ex => {
      ex.plannedSets.forEach(s => { totalPlannedVolume += s.weight * s.reps; totalPlannedReps += s.reps; });
      ex.actualSets.forEach(s => { totalActualVolume += s.weight * s.reps; totalActualReps += s.reps; });
    });

    const volDiff = totalActualVolume - totalPlannedVolume;
    const repsDiff = totalActualReps - totalPlannedReps;

    return (
      <div className="flex-col gap-6 w-full">
        <h2 className="text-gradient" style={{ fontSize: '1.8rem', textAlign: 'center' }}>Résumé de la Séance</h2>
        <h3 style={{ textAlign: 'center', color: 'var(--text-main)', fontSize: '1.2rem' }}>{sessionName}</h3>

        {/* Global stats */}
        <div className="flex gap-4">
          <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Volume Total</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{(totalActualVolume / 1000).toFixed(1)}k kg</div>
            <div className="flex items-center gap-1" style={{ color: diffColor(volDiff), fontSize: '0.8rem', fontWeight: 600 }}>
              {diffIcon(volDiff)} {diffLabel(volDiff, 'kg')}
            </div>
          </div>
          <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Reps Totales</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{totalActualReps}</div>
            <div className="flex items-center gap-1" style={{ color: diffColor(repsDiff), fontSize: '0.8rem', fontWeight: 600 }}>
              {diffIcon(repsDiff)} {diffLabel(repsDiff, '')}
            </div>
          </div>
          <div className="glass-card flex-col items-center gap-1" style={{ flex: 1, textAlign: 'center' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Exercices</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{exercises.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>✓ Finis</div>
          </div>
        </div>

        {/* Real calories summary (no estimation) */}
        <div className="glass-card flex-col items-center justify-center gap-2" style={{ background: 'rgba(255, 105, 180, 0.1)', borderColor: 'var(--primary)', padding: '1.5rem' }}>
          <div className="flex items-center justify-center gap-2">
            <Flame size={26} color="var(--primary)" />
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
              {exercises.reduce((acc, e) => acc + (e.caloriesManual || 0), 0)}
              <span style={{ fontSize: '1rem', marginLeft: '0.4rem' }}>kcal brûlées</span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, borderTop: '1px dashed var(--border-glass)', width: '100%', textAlign: 'center', paddingTop: '0.8rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Total des calories réelles ✨
          </div>
        </div>

        {/* Per-exercise comparison */}
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Détail par Exercice</h4>
        {exercises.map((ex, exIdx) => {
          const plannedVol = ex.plannedSets.reduce((a, s) => a + s.weight * s.reps, 0);
          const actualVol = ex.actualSets.reduce((a, s) => a + s.weight * s.reps, 0);
          const exVolDiff = actualVol - plannedVol;

          return (
            <div key={exIdx} className="glass-card flex-col gap-3">
              <div className="flex items-center justify-between">
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{ex.exercise.name}</div>
                {ex.exercise.category === 'Cardio' ? (
                  <div className="flex items-center gap-3" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
                    <span>{ex.actualSets[0].weight} min</span>
                    <span>|</span>
                    <span>{ex.caloriesManual || 0} kcal</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1" style={{ color: diffColor(exVolDiff), fontSize: '0.85rem', fontWeight: 600 }}>
                    {diffIcon(exVolDiff)} {diffLabel(exVolDiff, 'kg')} vol.
                  </div>
                )}
              </div>

              {/* Table (Hide for cardio) */}
              {ex.exercise.category !== 'Cardio' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                        <th style={thStyle}>Série</th>
                        <th style={thStyle}>Prévu</th>
                        <th style={thStyle}>Réalisé</th>
                        <th style={thStyle}>Diff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Show rows up to max of planned/actual */}
                      {Array.from({ length: Math.max(ex.plannedSets.length, ex.actualSets.length) }).map((_, sIdx) => {
                        const planned = ex.plannedSets[sIdx];
                        const actual = ex.actualSets[sIdx];
                        const wDiffS = planned && actual ? diffValue(planned.weight, actual.weight) : 0;
                        const rDiffS = planned && actual ? diffValue(planned.reps, actual.reps) : 0;

                        return (
                          <tr key={sIdx} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={tdStyle}>{sIdx + 1}</td>
                            <td style={tdStyle}>
                              {planned ? `${planned.weight}kg × ${planned.reps}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={tdStyle}>
                              {actual ? `${actual.weight}kg × ${actual.reps}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={tdStyle}>
                              {planned && actual ? (
                                <div className="flex-col" style={{ gap: '2px' }}>
                                  {wDiffS !== 0 && (
                                    <span className="flex items-center gap-1" style={{ color: diffColor(wDiffS), fontWeight: 600, fontSize: '0.8rem' }}>
                                      {diffIcon(wDiffS)} {diffLabel(wDiffS, 'kg')}
                                    </span>
                                  )}
                                  {rDiffS !== 0 && (
                                    <span className="flex items-center gap-1" style={{ color: diffColor(rDiffS), fontWeight: 600, fontSize: '0.8rem' }}>
                                      {diffIcon(rDiffS)} {diffLabel(rDiffS, ' reps')}
                                    </span>
                                  )}
                                  {wDiffS === 0 && rDiffS === 0 && (
                                    <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>✓ Parfait</span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{!planned ? '+ajouté' : 'retiré'}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Verdict */}
        <div className="glass-card flex-col items-center gap-2" style={{
          textAlign: 'center', padding: '1.5rem',
          background: volDiff >= 0 ? 'rgba(50, 205, 50, 0.08)' : 'rgba(255, 20, 147, 0.08)',
          borderColor: volDiff >= 0 ? 'var(--success)' : 'var(--danger)',
        }}>
          <div style={{ fontSize: '2rem' }}>{volDiff >= 0 ? '💪' : '😤'}</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: volDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {volDiff > 0 ? 'Tu as dépassé tes objectifs !' : volDiff === 0 ? 'Objectifs atteints parfaitement !' : 'Tu as fait un peu moins que prévu, mais t\'as quand même bossé !'}
          </div>
        </div>

        <button className="btn-primary flex justify-center gap-2 items-center" onClick={resetAll} style={{ background: 'var(--success)', borderColor: '#2E8B57', boxShadow: '4px 4px 0px #2E8B57' }}>
          <CheckCircle size={18} /> Enregistrer & Terminer
        </button>
      </div>
    );
  }

  return null;
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem',
  background: 'rgba(255, 192, 203, 0.2)',
  border: '2px solid var(--border-glass)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  textAlign: 'center',
  fontFamily: 'var(--font-heading)',
  fontSize: '1.2rem',
};

const inputStyleSmall: React.CSSProperties = {
  width: '100%', padding: '0.4rem',
  background: 'rgba(255, 192, 203, 0.2)',
  border: '2px solid var(--border-glass)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-main)',
  textAlign: 'center',
  fontFamily: 'var(--font-heading)',
  fontSize: '1rem',
};

const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.25rem',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '0.8rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.25rem',
  textAlign: 'center',
};

export default WorkoutLogger;
