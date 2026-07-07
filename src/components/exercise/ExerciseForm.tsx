import { useState, useEffect } from 'react';
import type { Exercise, ExerciseCategory } from '../../types/exercise';
import { EXERCISE_CATEGORIES } from '../../types/exercise';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export interface ExerciseFormData {
  name: string;
  category: ExerciseCategory;
  description?: string;
}

export interface ExerciseFormProps {
  isOpen: boolean;
  initialData?: Exercise;
  defaultCategory?: ExerciseCategory;
  onSubmit: (data: ExerciseFormData) => void;
  onCancel: () => void;
}

export function ExerciseForm({
  isOpen,
  initialData,
  defaultCategory,
  onSubmit,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('胸');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setDescription(initialData.description ?? '');
    } else {
      setName('');
      setCategory(defaultCategory ?? '胸');
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('请输入动作名称');
      return;
    }
    onSubmit({ name: trimmedName, category, description: description.trim() || undefined });
    setName('');
    setCategory('胸');
    setDescription('');
    setError('');
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditing ? '编辑训练动作' : '新增训练动作'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            动作名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="例如：杠铃卧推"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            类别 <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            {EXERCISE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可选，添加动作说明..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? '保存修改' : '添加动作'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
