import { useState, useRef, useEffect } from 'react';
import type { TrainingDay } from '../../types/record';
import { formatDate } from '../../utils/date';
import { Button } from '../common/Button';

export interface TrainingDayCardProps {
  day: TrainingDay;
  getExerciseName: (id: string) => string;
  onEditExercises: (day: TrainingDay) => void;
  onDelete: (day: TrainingDay) => void;
  onRename: (id: string, name: string) => void;
  onNoteChange: (id: string, note: string) => void;
}

export function TrainingDayCard({
  day,
  getExerciseName,
  onEditExercises,
  onDelete,
  onRename,
  onNoteChange,
}: TrainingDayCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(day.name);
  const [showNote, setShowNote] = useState(false);
  const [noteInput, setNoteInput] = useState(day.note ?? '');
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNoteInput(day.note ?? '');
  }, [day.note]);

  useEffect(() => {
    if (showNote && noteRef.current) {
      noteRef.current.focus();
    }
  }, [showNote]);

  function handleNoteSave() {
    const trimmed = noteInput.trim();
    onNoteChange(day.id, trimmed);
    setShowNote(false);
  }

  function handleNoteCancel() {
    setNoteInput(day.note ?? '');
    setShowNote(false);
  }

  function handleRenameSubmit() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== day.name) {
      onRename(day.id, trimmed);
    }
    setIsRenaming(false);
  }

  function handleRenameCancel() {
    setNameInput(day.name);
    setIsRenaming(false);
  }

  const totalSets = day.exercises.reduce((sum, de) => sum + de.sets.length, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
      {/* Header — click name to rename */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') handleRenameCancel();
                }}
                className="px-2 py-1 border border-green-400 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
                autoFocus
              />
              <button
                onClick={handleRenameSubmit}
                className="p-1 text-green-500 hover:bg-green-50 rounded cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleRenameCancel}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setNameInput(day.name);
                setIsRenaming(true);
              }}
              title="点击编辑名称"
            >
              <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-green-600 transition-colors">
                {day.name}
              </h3>
              <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-0.5">{formatDate(day.date)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNoteInput(day.note ?? '');
              setShowNote(!showNote);
            }}
            title="备注"
          >
            <svg className={`w-4 h-4 ${day.note ? 'text-yellow-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(day)} title="删除">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Exercise area — click to edit exercises */}
      <div
        onClick={() => onEditExercises(day)}
        className="cursor-pointer rounded-lg -mx-1 px-1 py-0.5 hover:bg-green-50/60 transition-colors"
      >
        {day.exercises.length > 0 ? (
          <div className="space-y-3">
            {day.exercises.map((de, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-800 font-semibold">
                    {getExerciseName(de.exerciseId)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {de.sets.length}组
                  </span>
                </div>
                <div className="space-y-0.5">
                  {de.sets.map((s) => (
                    <div
                      key={s.setNumber}
                      className="flex items-center justify-between text-xs text-gray-500 pl-2"
                    >
                      <span className="font-mono text-gray-600">
                        {s.weight}kg
                      </span>
                      <span>{s.reps}次</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-1.5 mt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>
                {day.exercises.length} 个动作 · {totalSets} 组
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-green-500">
                点击编辑 →
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg hover:border-green-400 hover:text-green-500 transition-colors">
            + 点击添加训练内容
          </div>
        )}
      </div>

      {/* Note display / inline editor */}
      {showNote ? (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <textarea
            ref={noteRef}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="训练日备注..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" size="sm" onClick={handleNoteCancel}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={handleNoteSave}>
              保存
            </Button>
          </div>
        </div>
      ) : day.note ? (
        <p className="text-xs text-gray-500 mt-2 truncate">
          📝 {day.note}
        </p>
      ) : null}
    </div>
  );
}
