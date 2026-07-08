import { useState } from 'react';
import { useExercises } from './hooks/useExercises';
import { useTrainingDays } from './hooks/useTrainingDays';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { ExerciseList } from './components/exercise/ExerciseList';
import { TrainingDayList } from './components/record/TrainingDayList';
import { FilterBar } from './components/filter/FilterBar';
import { TrainingStats } from './components/stats/TrainingStats';
import { ExerciseHistory } from './components/history/ExerciseHistory';
import type { FilterConditions } from './types/filter';
import type { Exercise, ExerciseCategory } from './types/exercise';
import type { TrainingDay } from './types/record';
import { todayISO, daysAgoISO } from './utils/date';

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
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exercises={exercises}
        trainingDays={trainingDays}
        onImportData={handleImportData}
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
            <FilterBar
              filters={filters}
              exercises={exercises}
              onChange={setFilters}
              resultCount={filteredDays.length}
            />
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
    </div>
  );
}

export default App;
