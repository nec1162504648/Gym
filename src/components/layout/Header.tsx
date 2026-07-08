import { useRef } from 'react';
import { Button } from '../common/Button';
import { exportToJsonFile, importFromJsonFile } from '../../utils/storage';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';

export interface HeaderProps {
  activeTab: 'exercises' | 'records' | 'stats' | 'history';
  onTabChange: (tab: 'exercises' | 'records' | 'stats' | 'history') => void;
  exercises: Exercise[];
  trainingDays: TrainingDay[];
  onImportData: (exercises: Exercise[], trainingDays: TrainingDay[]) => void;
}

export function Header({
  activeTab,
  onTabChange,
  exercises,
  trainingDays,
  onImportData,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              🏋️ GYM
            </h1>
            <nav className="flex gap-1">
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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出
            </Button>
            <Button variant="ghost" size="sm" onClick={handleImportClick}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              导入
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
