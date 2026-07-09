import { useState, useEffect, useRef } from 'react';
import { useExercises } from './hooks/useExercises';
import { useTrainingDays } from './hooks/useTrainingDays';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { ExerciseList } from './components/exercise/ExerciseList';
import { TrainingDayList } from './components/record/TrainingDayList';
import { FilterBar } from './components/filter/FilterBar';
import { TrainingStats } from './components/stats/TrainingStats';
import { ExerciseHistory } from './components/history/ExerciseHistory';
import { SyncSettings } from './components/sync/SyncSettings';
import type { FilterConditions } from './types/filter';
import type { Exercise, ExerciseCategory } from './types/exercise';
import type { TrainingDay } from './types/record';
import type { ExportData } from './utils/storage';
import { todayISO, daysAgoISO } from './utils/date';
import {
  fetchGistData,
  pushGistData,
  loadSyncConfig,
} from './utils/gistSync';

function App() {
  const {
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    setExercises,
  } = useExercises();

  const {
    trainingDays,
    addTrainingDay,
    updateTrainingDay,
    deleteTrainingDay,
    getFilteredTrainingDays,
    getDayCountByExercise,
    setTrainingDays,
  } = useTrainingDays({ exercises });

  const [activeTab, setActiveTab] = useState<'exercises' | 'records' | 'stats' | 'history'>('records');
  const [filters, setFilters] = useState<FilterConditions>({
    startDate: daysAgoISO(30),
    endDate: todayISO(),
    exerciseIds: [],
    category: '',
  });

  const filteredDays = getFilteredTrainingDays(filters);

  // --- Mobile: filter toggle & sync modal ---
  const [showFilter, setShowFilter] = useState(false);
  const [showSyncSettings, setShowSyncSettings] = useState(false);

  // --- Cloud sync ---
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull from Gist on mount if sync enabled
  useEffect(() => {
    const cfg = loadSyncConfig();
    if (!cfg.enabled || !cfg.token || !cfg.gistId) return;
    (async () => {
      setSyncStatus('syncing');
      const remote = await fetchGistData(cfg.token, cfg.gistId);
      setSyncStatus('idle');
      if (!remote) return;
      // Merge: remote newer → overwrite local
      const localDate = localStorage.getItem('gym_last_sync');
      if (!localDate || remote.exportedAt > localDate) {
        setExercises(remote.exercises);
        setTrainingDays(remote.trainingDays);
        localStorage.setItem('gym_last_sync', remote.exportedAt);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced push to Gist on data changes
  useEffect(() => {
    const cfg = loadSyncConfig();
    if (!cfg.enabled || !cfg.token || !cfg.gistId) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const data: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        exercises,
        trainingDays,
      };
      const ok = await pushGistData(cfg.token, cfg.gistId, data);
      setSyncStatus('idle');
      if (ok) {
        localStorage.setItem('gym_last_sync', data.exportedAt);
      } else {
        setSyncStatus('error');
      }
    }, 1500);
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [exercises, trainingDays]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePullData(pulledExercises: Exercise[], pulledTrainingDays: TrainingDay[]) {
    setExercises(pulledExercises);
    setTrainingDays(pulledTrainingDays);
  }

  function handleImportData(
    importedExercises: Exercise[],
    importedTrainingDays: TrainingDay[]
  ) {
    setExercises(importedExercises);
    setTrainingDays(importedTrainingDays);
  }

  function handleAddExercise(data: {
    name: string;
    category: ExerciseCategory;
    description?: string;
  }) {
    addExercise(data.name, data.category, data.description);
  }

  function handleEditExercise(
    id: string,
    data: { name: string; category: ExerciseCategory; description?: string }
  ) {
    updateExercise(id, data);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exercises={exercises}
        trainingDays={trainingDays}
        onImportData={handleImportData}
        syncStatus={syncStatus}
        onPullData={handlePullData}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        filteredCount={filteredDays.length}
        onOpenSync={() => setShowSyncSettings(true)}
      />
      <Container>
        {activeTab === 'exercises' ? (
          <ExerciseList
            exercises={exercises}
            getRecordCount={getDayCountByExercise}
            onAdd={handleAddExercise}
            onEdit={handleEditExercise}
            onDelete={deleteExercise}
          />
        ) : activeTab === 'stats' ? (
          <TrainingStats
            trainingDays={trainingDays}
            exercises={exercises}
          />
        ) : activeTab === 'history' ? (
          <ExerciseHistory
            trainingDays={trainingDays}
            exercises={exercises}
          />
        ) : (
          <div>
            {/* Collapsible filter panel (mobile) / always visible (desktop) */}
            <div className={showFilter ? 'block' : 'hidden md:block'}>
              <FilterBar
                filters={filters}
                exercises={exercises}
                onChange={setFilters}
                resultCount={filteredDays.length}
              />
            </div>

            <TrainingDayList
              trainingDays={filteredDays}
              allDays={trainingDays}
              exercises={exercises}
              getExerciseById={getExerciseById}
              onAdd={addTrainingDay}
              onUpdate={updateTrainingDay}
              onRename={(id, name) => updateTrainingDay(id, { name })}
              onDateChange={(id, date) => {
                updateTrainingDay(id, { date });
                setFilters((f) => ({
                  ...f,
                  startDate: date < f.startDate ? date : f.startDate,
                  endDate: date > f.endDate ? date : f.endDate,
                }));
              }}
              onNoteChange={(id, note) =>
                updateTrainingDay(id, { note: note || undefined })
              }
              onDelete={deleteTrainingDay}
            />
          </div>
        )}
      </Container>

      {/* --- Mobile bottom nav bar --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center px-1 py-1">
          {([
            ['records', '训练记录'],
            ['stats', '训练统计'],
            ['history', '动作历史'],
            ['exercises', '训练动作'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <SyncSettings
        isOpen={showSyncSettings}
        onClose={() => setShowSyncSettings(false)}
        exercises={exercises}
        trainingDays={trainingDays}
        onPullData={handlePullData}
      />
    </div>
  );
}

export default App;
