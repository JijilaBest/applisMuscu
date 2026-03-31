import React, { useState } from 'react';
import { Plus, Check, ChevronRight, CheckCircle, Circle, Play, Edit3, ArrowDown, ArrowUp, Minus, X, BarChart2 } from 'lucide-react';
import type { MuscleCategory, Muscle, Exercise } from '../types';
import { mockExercises } from '../store/mockData';

type PlannedSet = { reps: number; weight: number };
type ActualSet = { reps: number; weight: number; done: boolean };
type LoggedExercise = {
  exercise: Exercise;
  plannedSets: PlannedSet[];
  actualSets: ActualSet[];
  validated: boolean;
};

type SessionPhase = 'naming' | 'planning' | 'realisation' | 'summary';

const WorkoutLogger: React.FC = () => {
  const [phase, setPhase] = useState<SessionPhase>('naming');
  const [sessionName, setSessionName] = useState('');

  // Planning wizard
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<MuscleCategory | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [planningSets, setPlanningSets] = useState([{ reps: 10, weight: 20 }]);

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
    next[exIdx].actualSets[setIdx].done = !next[exIdx].actualSets[setIdx].done;
    setExercises(next);
  };
  const addActualSet = (exIdx: number) => {
    const next = [...exercises];
    next[exIdx].actualSets.push({ reps: 10, weight: 20, done: false });
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
    if (next[exIdx].validated) setEditingIndex(null);
    setExercises(next);
  };

  const allValidated = exercises.length > 0 && exercises.every(e => e.validated);

  const finishWorkout = () => {
    setPhase('summary');
  };

  const resetAll = () => {
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
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Phase de planification — {exercises.length} exercice(s) prévu(s)</span>
          </div>
          {exercises.length > 0 && (
            <button
              onClick={startRealisation}
              className="btn-primary flex items-center gap-2"
              style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}
            >
              <Play size={16} /> Go !
            </button>
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
            <div className="flex gap-4">
              <button className="glass-card flex-col items-center justify-center gap-2" style={{ flex: 1, padding: '2rem 1rem' }}
                onClick={() => handleCategorySelect('Haut du Corps')}>
                <div style={{ fontSize: '2rem' }}>💪</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Haut du Corps</div>
              </button>
              <button className="glass-card flex-col items-center justify-center gap-2" style={{ flex: 1, padding: '2rem 1rem' }}
                onClick={() => handleCategorySelect('Bas du Corps')}>
                <div style={{ fontSize: '2rem' }}>🦵</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Bas du Corps</div>
              </button>
            </div>
          </div>
        )}

        {wizardStep === 2 && category && (
          <div className="flex-col gap-4">
            <div className="flex items-center gap-2" onClick={() => setWizardStep(1)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> <span>Retour aux Catégories</span>
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>Choisir un Muscle</h3>
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
              <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} /> <span>Retour aux Muscles</span>
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
            <div className="glass-card flex-col gap-4">
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

        {exercises.map((ex, exIdx) => {
          const isEditing = editingIndex === exIdx;
          const isValidated = ex.validated;
          return (
            <div key={exIdx} className="glass-card flex-col gap-3" style={{
              borderColor: isValidated ? 'var(--success)' : isEditing ? 'var(--primary)' : 'var(--border-glass)',
              transition: 'all 0.3s',
              opacity: isValidated ? 0.85 : 1,
            }}>
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

              {/* Planned overview */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '2rem' }}>
                Prévu : {ex.plannedSets.map((s) => `${s.weight}kg×${s.reps}`).join(' | ')}
              </div>

              {/* Editing actual sets */}
              {isEditing && !isValidated && (
                <div className="flex-col gap-2" style={{ marginLeft: '0.5rem', marginTop: '0.5rem', padding: '1rem', background: 'rgba(255, 192, 203, 0.08)', borderRadius: 'var(--radius-sm)' }}>
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
                  <button className="btn-secondary flex justify-center gap-2 items-center" onClick={() => addActualSet(exIdx)} style={{ padding: '0.5rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    <Plus size={14} /> Série
                  </button>
                </div>
              )}

              {/* Quick view actual sets when not editing */}
              {!isEditing && (
                <div className="flex gap-2" style={{ flexWrap: 'wrap', marginLeft: '2rem' }}>
                  {ex.actualSets.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '0.8rem', padding: '0.2rem 0.5rem',
                      background: s.done ? 'var(--success)' : isValidated ? 'var(--success)' : 'var(--primary)',
                      color: '#fff', borderRadius: '4px',
                      fontFamily: 'var(--font-heading)',
                      opacity: s.done || isValidated ? 1 : 0.6,
                    }}>
                      {s.weight}kg × {s.reps}
                    </span>
                  ))}
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
                <div className="flex items-center gap-1" style={{ color: diffColor(exVolDiff), fontSize: '0.85rem', fontWeight: 600 }}>
                  {diffIcon(exVolDiff)} {diffLabel(exVolDiff, 'kg')} vol.
                </div>
              </div>

              {/* Table */}
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

        <button className="btn-primary flex justify-center gap-2 items-center" onClick={resetAll}>
          <Plus size={18} /> Nouvelle Séance
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
