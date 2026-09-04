import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MushroomSpot, DailyQuota, UserSettings } from './types/mushroom';
import {
  loadSpots,
  saveSpots,
  loadDailyQuota,
  saveDailyQuota,
  checkAndResetDailyQuota,
  loadSettings,
  saveSettings,
  INITIAL_DEMO_SPOTS,
} from './utils/storage';
import { playAlertChime, triggerVibration } from './utils/audio';
import { Header } from './components/Header';
import { MushroomCard } from './components/MushroomCard';
import { MushroomModal } from './components/MushroomModal';
import { OledHudModal } from './components/OledHudModal';
import { GuideModal } from './components/GuideModal';
import { Plus, CheckCircle, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [spots, setSpots] = useState<MushroomSpot[]>([]);
  const [quota, setQuota] = useState<DailyQuota>({ remaining: 3, lastResetDate: '' });
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [theme, setTheme] = useState<'oled' | 'light'>(settings.theme || 'oled');

  // 彈窗狀態
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<MushroomSpot | null>(null);
  const [isOledHudOpen, setIsOledHudOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'ready'>('all');

  // 通知權限狀態
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // 追蹤到期與提前 1~3 分鐘提醒觸發記錄
  const finalAlertedSpotIdsRef = useRef<Set<string>>(new Set());
  const advanceAlertedSpotIdsRef = useRef<Set<string>>(new Set());

  // 初次載入
  useEffect(() => {
    const loadedSpots = loadSpots();
    if (loadedSpots.length === 0) {
      setSpots(INITIAL_DEMO_SPOTS);
      saveSpots(INITIAL_DEMO_SPOTS);
    } else {
      setSpots(loadedSpots);
    }

    const currentQuota = loadDailyQuota();
    setQuota(checkAndResetDailyQuota(currentQuota));

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // 同步主題設定到 DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.remove('dark');
        root.style.backgroundColor = '#f8fafc';
        document.body.style.backgroundColor = '#f8fafc';
      } else {
        root.classList.add('dark');
        root.style.backgroundColor = '#000000';
        document.body.style.backgroundColor = '#000000';
      }
    }
  }, [theme]);

  // 切換主題
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme: 'oled' | 'light' = prev === 'oled' ? 'light' : 'oled';
      const updatedSettings: UserSettings = { ...settings, theme: nextTheme };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
      return nextTheme;
    });
  };

  // 當 spots 異動時自動存檔
  useEffect(() => {
    if (spots.length > 0) {
      saveSpots(spots);
    }
  }, [spots]);

  // 當 quota 異動時存檔
  useEffect(() => {
    if (quota.lastResetDate) {
      saveDailyQuota(quota);
    }
  }, [quota]);

  // 當 settings 異動時存檔
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // 請求推播通知權限
  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('您的瀏覽器不支援 Web Notification API。建議加入主畫面使用或使用行事曆匯出提醒。');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('皮克敏蘑菇追蹤器', {
          body: '通知已啟用！系統將於重生前 1~3 分鐘提早提醒，並於準時重生時發出提示。',
          icon: './mushroom-icon.svg',
        });
      } else {
        setNotificationsEnabled(false);
      }
    } catch (err) {
      console.warn('請求通知權限異常：', err);
    }
  };

  // 定時鐘（每秒更新）、檢查跨日重置與到期提醒
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // 檢查是否跨過午夜 00:00 自動重置每日次數
      setQuota((prevQuota) => checkAndResetDailyQuota(prevQuota));

      // 預設提前提醒時間（毫秒），例如 2 分鐘（在 1~3 分鐘範圍）
      const advanceWarningMs = (settings.advanceWarningMinutes || 2) * 60 * 1000;

      // 檢查蘑菇倒數
      setSpots((prevSpots) => {
        let hasChanges = false;
        const nextSpots = prevSpots.map((spot) => {
          let targetEndTime: number | null | undefined = null;

          if (spot.status === 'cooldown') {
            targetEndTime = spot.cooldownEndTime;
          } else if (spot.status === 'battling') {
            targetEndTime = spot.battleEndTime;
          }

          if (!targetEndTime) return spot;

          const diffMs = targetEndTime - now;

          // 1. 檢查是否進入提前 1~3 分鐘預警區間（diffMs <= advanceWarningMs 且 diffMs > 0）
          if (diffMs <= advanceWarningMs && diffMs > 0) {
            if (!advanceAlertedSpotIdsRef.current.has(spot.id)) {
              advanceAlertedSpotIdsRef.current.add(spot.id);

              // 溫和預警音效與震動
              if (settings.soundEnabled) playAlertChime();
              if (settings.vibrationEnabled) triggerVibration([150, 100, 150]);

              // 提早通知推播
              if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                try {
                  const minutesLeft = Math.ceil(diffMs / 60000);
                  new Notification(`⚠️ 蘑菇即將出現：${spot.name}`, {
                    body: `${spot.name} 將於 ${minutesLeft} 分鐘後重生！請準備開啟皮克敏 Bloom。`,
                    icon: './mushroom-icon.svg',
                    tag: `mushroom-advance-${spot.id}`,
                  });
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }

          // 2. 檢查是否正式到期（diffMs <= 0）
          if (diffMs <= 0) {
            if (!finalAlertedSpotIdsRef.current.has(spot.id)) {
              finalAlertedSpotIdsRef.current.add(spot.id);

              if (settings.soundEnabled) playAlertChime();
              if (settings.vibrationEnabled) triggerVibration([300, 150, 300, 150, 500]);

              if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                try {
                  new Notification(`🍄 蘑菇已出現：${spot.name}`, {
                    body: `${spot.name} 重生完畢！可立即登入皮克敏 Bloom 派兵討伐！`,
                    icon: './mushroom-icon.svg',
                    tag: `mushroom-ready-${spot.id}`,
                  });
                } catch (e) {
                  console.error(e);
                }
              }
            }

            hasChanges = true;
            return {
              ...spot,
              status: 'ready' as const,
              cooldownEndTime: null,
              battleEndTime: null,
              updatedAt: now,
            };
          }

          return spot;
        });

        return hasChanges ? nextSpots : prevSpots;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.soundEnabled, settings.vibrationEnabled, settings.advanceWarningMinutes]);

  // 當應用程式返回前景時，立即確認跨日重置
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        setQuota((prev) => checkAndResetDailyQuota(prev));
      }
    };
    window.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);
    return () => {
      window.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
    };
  }, []);

  // 額度增減
  const handleUpdateQuota = (delta: number) => {
    setQuota((prev) => ({
      ...prev,
      remaining: Math.max(0, Math.min(3, prev.remaining + delta)),
    }));
  };

  // 儲存單一點位
  const handleSaveSpot = (spotData: Partial<MushroomSpot>) => {
    if (editingSpot) {
      // 編輯
      setSpots((prev) =>
        prev.map((s) => (s.id === editingSpot.id ? { ...s, ...spotData, updatedAt: Date.now() } : s))
      );
      setEditingSpot(null);
    } else {
      // 新增
      const newSpot: MushroomSpot = {
        id: `spot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: spotData.name || '未命名蘑菇',
        category: spotData.category || 'color',
        typeId: spotData.typeId || 'red',
        size: spotData.size || 'normal',
        notes: spotData.notes || '',
        status: 'idle',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSpots((prev) => [newSpot, ...prev]);
    }
  };

  // 更新卡片狀態（重置通知標記）
  const handleUpdateSpot = useCallback((updated: MushroomSpot) => {
    finalAlertedSpotIdsRef.current.delete(updated.id);
    advanceAlertedSpotIdsRef.current.delete(updated.id);
    setSpots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  // 刪除點位
  const handleDeleteSpot = (id: string) => {
    finalAlertedSpotIdsRef.current.delete(id);
    advanceAlertedSpotIdsRef.current.delete(id);
    setSpots((prev) => prev.filter((s) => s.id !== id));
  };

  // 載入示範資料
  const handleLoadDemoData = () => {
    finalAlertedSpotIdsRef.current.clear();
    advanceAlertedSpotIdsRef.current.clear();
    setSpots(INITIAL_DEMO_SPOTS);
    saveSpots(INITIAL_DEMO_SPOTS);
  };

  // 篩選
  const filteredSpots = spots.filter((s) => {
    if (filterMode === 'active') {
      return s.status === 'cooldown' || s.status === 'battling';
    }
    if (filterMode === 'ready') {
      return s.status === 'ready';
    }
    return true;
  });

  const readyCount = spots.filter((s) => s.status === 'ready').length;
  const activeCount = spots.filter((s) => s.status === 'cooldown' || s.status === 'battling').length;
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900 selection:bg-slate-200' : 'bg-black text-neutral-100 selection:bg-neutral-800'
      }`}
    >
      {/* 頂部導航列與額度條 */}
      <Header
        quota={quota}
        onUpdateQuota={handleUpdateQuota}
        onOpenNewModal={() => {
          setEditingSpot(null);
          setIsNewModalOpen(true);
        }}
        onOpenOledHud={() => setIsOledHudOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        notificationsEnabled={notificationsEnabled}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 主工作區 */}
      <main className="flex-1 max-w-xl mx-auto w-full px-3 py-3 space-y-3">
        {/* 快捷篩選標籤列 */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 p-1 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-neutral-950 border-neutral-900'
            }`}
          >
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterMode === 'all'
                  ? isLight
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-neutral-800 text-white shadow-sm'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              全部 ({spots.length})
            </button>
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterMode === 'active'
                  ? isLight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Clock size={12} />
              <span>計時中 ({activeCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('ready')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterMode === 'ready'
                  ? isLight
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <CheckCircle size={12} />
              <span>已出現 ({readyCount})</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingSpot(null);
              setIsNewModalOpen(true);
            }}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border font-semibold transition-colors shadow-sm ${
              isLight
                ? 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
                : 'bg-neutral-950 border-neutral-800 text-emerald-400 hover:bg-neutral-900'
            }`}
          >
            <Plus size={14} />
            <span>加點位</span>
          </button>
        </div>

        {/* 蘑菇卡片清單 */}
        {filteredSpots.length > 0 ? (
          <div className="space-y-2.5">
            {filteredSpots.map((spot) => (
              <MushroomCard
                key={spot.id}
                spot={spot}
                currentTime={currentTime}
                onUpdateSpot={handleUpdateSpot}
                onDeleteSpot={handleDeleteSpot}
                onEditSpot={(s) => {
                  setEditingSpot(s);
                  setIsNewModalOpen(true);
                }}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div
            className={`py-14 text-center border border-dashed rounded-2xl p-6 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                : 'bg-neutral-950/40 border-neutral-900 text-neutral-300'
            }`}
          >
            <div className="text-3xl mb-2">🍄</div>
            <div className="text-sm font-bold">目前尚無符合條件的蘑菇點位</div>
            <p className={`text-xs mt-1 max-w-xs mx-auto ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
              點擊右上角「新增」建立專屬蘑菇點位，或載入示範資料進行體驗。
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleLoadDemoData}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                }`}
              >
                載入示範資料
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                新增第一個點位
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部資訊列 */}
      <footer
        className={`border-t px-4 py-3 text-center text-[11px] space-y-1 transition-colors ${
          isLight ? 'border-slate-200 bg-white text-slate-500' : 'border-neutral-900 bg-black text-neutral-600'
        }`}
      >
        <div>皮克敏蘑菇時間紀錄器 · 5 分鐘重生冷卻 · 提前 1~3 分鐘預警 · 三大分類派遣</div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setIsGuideOpen(true)} className="hover:underline">
            使用說明書
          </button>
          <span>·</span>
          <button onClick={handleLoadDemoData} className="hover:underline">
            重置示範資料
          </button>
          <span>·</span>
          <button
            onClick={() => {
              if (confirm('確定清空所有點位與自訂資料嗎？')) {
                setSpots([]);
                saveSpots([]);
              }
            }}
            className="hover:text-red-500 hover:underline"
          >
            清空資料
          </button>
        </div>
      </footer>

      {/* 彈窗模組群 */}
      <MushroomModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingSpot(null);
        }}
        onSave={handleSaveSpot}
        editingSpot={editingSpot}
        theme={theme}
      />

      <OledHudModal
        isOpen={isOledHudOpen}
        onClose={() => setIsOledHudOpen(false)}
        spots={spots}
        currentTime={currentTime}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadDemoData={handleLoadDemoData}
        theme={theme}
      />
    </div>
  );
};
export default App;
