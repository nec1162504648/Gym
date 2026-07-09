import { useRef, useState } from 'react';
import { Button } from '../common/Button';
import { exportToJsonFile, importFromJsonFile } from '../../utils/storage';
import { SyncSettings } from '../sync/SyncSettings';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';

export interface HeaderProps {
  activeTab: 'exercises' | 'records' | 'stats' | 'history';
  onTabChange: (tab: 'exercises' | 'records' | 'stats' | 'history') => void;
  exercises: Exercise[];
  trainingDays: TrainingDay[];
  onImportData: (exercises: Exercise[], trainingDays: TrainingDay[]) => void;
  syncStatus: 'idle' | 'syncing' | 'error';
  onPullData: (exercises: Exercise[], trainingDays: TrainingDay[]) => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  filteredCount: number;
  onOpenSync: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  exercises,
  trainingDays,
  onImportData,
  syncStatus,
  onPullData,
  showFilter,
  onToggleFilter,
  filteredCount,
  onOpenSync,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSyncSettings, setShowSyncSettings] = useState(false);

  function handleExport() {
    exportToJsonFile(exercises, trainingDays);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const confirmed = window.confirm('导入将覆盖现有数据，确认继续吗？');
      if (!confirmed) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const data = await importFromJsonFile(file);
      onImportData(data.exercises, data.trainingDays);
      alert('数据导入成功！');
    } catch (err) {
      alert(err instanceof Error ? err.message : '导入失败');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <header className="sticky top-0 bg-white z-40 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-green-500 whitespace-nowrap">
              GYM
            </h1>
            {/* Mobile filter toggle */}
            <button
              onClick={onToggleFilter}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-xs">{filteredCount}天</span>
              <span className="text-gray-400 text-[10px]">{showFilter ? '▲' : '▼'}</span>
            </button>
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => onTabChange('records')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                训练记录
              </button>
              <button
                onClick={() => onTabChange('stats')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                训练统计
              </button>
              <button
                onClick={() => onTabChange('history')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                动作历史
              </button>
              <button
                onClick={() => onTabChange('exercises')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'exercises'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                训练动作
              </button>
            </nav>
          </div>

          {/* Mobile sync button (top-right) */}
          <button
            onClick={onOpenSync}
            className={`md:hidden p-2 rounded-lg cursor-pointer ${
              syncStatus === 'syncing'
                ? 'text-blue-500 animate-pulse'
                : syncStatus === 'error'
                ? 'text-red-400'
                : 'text-gray-500'
            }`}
            title="云同步"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setShowSyncSettings(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                syncStatus === 'syncing'
                  ? 'text-blue-500 animate-pulse'
                  : syncStatus === 'error'
                  ? 'text-red-400'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="云同步设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导出
            </Button>
            <Button variant="ghost" size="sm" onClick={handleImportClick}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导入
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <SyncSettings
            isOpen={showSyncSettings}
            onClose={() => setShowSyncSettings(false)}
            exercises={exercises}
            trainingDays={trainingDays}
            onPullData={onPullData}
          />
        </div>
      </div>
    </header>
  );
}
