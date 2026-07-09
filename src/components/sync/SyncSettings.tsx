import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { exportToJsonFile } from '../../utils/storage';
import {
  fetchGistData,
  pushGistData,
  createGist,
  loadSyncConfig,
  saveSyncConfig,
  type SyncConfig,
} from '../../utils/gistSync';
import type { Exercise } from '../../types/exercise';
import type { TrainingDay } from '../../types/record';

export interface SyncSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  trainingDays: TrainingDay[];
  onPullData: (exercises: Exercise[], trainingDays: TrainingDay[]) => void;
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export function SyncSettings({
  isOpen,
  onClose,
  exercises,
  trainingDays,
  onPullData,
}: SyncSettingsProps) {
  const [config, setConfig] = useState<SyncConfig>(loadSyncConfig);
  const [token, setToken] = useState(config.token);
  const [gistId, setGistId] = useState(config.gistId);
  const [enabled, setEnabled] = useState(config.enabled);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [lastSync, setLastSync] = useState(() => {
    try {
      return localStorage.getItem('gym_last_sync') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (isOpen) {
      const cfg = loadSyncConfig();
      setConfig(cfg);
      setToken(cfg.token);
      setGistId(cfg.gistId);
      setEnabled(cfg.enabled);
    }
  }, [isOpen]);

  function handleSave() {
    const newConfig: SyncConfig = { enabled, token, gistId };
    saveSyncConfig(newConfig);
    setConfig(newConfig);
    setStatus('success');
    setStatusMsg('配置已保存');
    setTimeout(() => setStatus('idle'), 2000);
  }

  async function handleTestConnection() {
    if (!token || !gistId) {
      setStatus('error');
      setStatusMsg('请填写 Token 和 Gist ID');
      return;
    }
    setStatus('syncing');
    setStatusMsg('测试连接中...');
    const data = await fetchGistData(token, gistId);
    if (data !== null) {
      setStatus('success');
      setStatusMsg('连接成功！Gist 可读写');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setStatusMsg('连接失败，请检查 Token 和 Gist ID');
    }
  }

  async function handleCreateGist() {
    if (!token) {
      setStatus('error');
      setStatusMsg('请先填写 GitHub Token');
      return;
    }
    setStatus('syncing');
    setStatusMsg('正在创建 Gist...');
    const id = await createGist(token, {
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises,
      trainingDays,
    });
    if (id) {
      setGistId(id);
      setStatus('success');
      setStatusMsg(`Gist 创建成功: ${id}`);
    } else {
      setStatus('error');
      setStatusMsg('创建失败，请检查 Token 权限（需 gist scope）');
    }
  }

  async function handlePush() {
    if (!token || !gistId) return;
    setStatus('syncing');
    setStatusMsg('正在推送数据...');
    const ok = await pushGistData(token, gistId, {
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises,
      trainingDays,
    });
    if (ok) {
      const now = new Date().toISOString();
      localStorage.setItem('gym_last_sync', now);
      setLastSync(now);
      setStatus('success');
      setStatusMsg('数据已推送到云端');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      setStatusMsg('推送失败');
    }
  }

  async function handlePull() {
    if (!token || !gistId) return;
    setStatus('syncing');
    setStatusMsg('正在拉取数据...');
    const data = await fetchGistData(token, gistId);
    if (data) {
      onPullData(data.exercises, data.trainingDays);
      const now = new Date().toISOString();
      localStorage.setItem('gym_last_sync', now);
      setLastSync(now);
      setStatus('success');
      setStatusMsg('数据已从云端拉取');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      setStatusMsg('拉取失败');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔄 云同步设置" size="md">
      <div className="space-y-4">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">启用云同步</p>
            <p className="text-xs text-gray-400 mt-0.5">
              通过 GitHub Gist 同步数据到多个设备
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                enabled ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* GitHub Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GitHub Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Settings → Developer settings → Personal access tokens → 勾选 gist 权限
          </p>
        </div>

        {/* Gist ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gist ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
              placeholder="32位哈希值"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Button variant="secondary" size="sm" onClick={handleCreateGist} disabled={status === 'syncing'}>
              创建
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleTestConnection} disabled={status === 'syncing'}>
            测试连接
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePush} disabled={status === 'syncing'}>
            推送到云端
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePull} disabled={status === 'syncing'}>
            从云端拉取
          </Button>
        </div>

        {/* Status */}
        {status !== 'idle' && (
          <div
            className={`text-xs px-3 py-2 rounded-lg ${
              status === 'syncing'
                ? 'bg-blue-50 text-blue-700'
                : status === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {status === 'syncing' && <span className="animate-pulse mr-1">⏳</span>}
            {status === 'success' && <span className="mr-1">✅</span>}
            {status === 'error' && <span className="mr-1">❌</span>}
            {statusMsg}
          </div>
        )}

        {/* Last sync */}
        {lastSync && (
          <p className="text-xs text-gray-400">
            最近同步：{new Date(lastSync).toLocaleString('zh-CN')}
          </p>
        )}

        {/* Save */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
          <Button variant="primary" onClick={handleSave}>
            保存配置
          </Button>
        </div>
      </div>
    </Modal>
  );
}
