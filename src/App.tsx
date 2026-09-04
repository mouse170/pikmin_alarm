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
import { ShortcutModal } from './components/ShortcutModal';
import { Plus, CheckCircle, Clock, Monitor, Sparkles } from 'lucide-react';

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
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
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
        root.classList.add('light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
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
      alert('您的瀏覽器不支援 Web Notification API。');
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

          // 1. 提前 1~3 分鐘預警
          if (diffMs <= advanceWarningMs && diffMs > 0) {
            if (!advanceAlertedSpotIdsRef.current.has(spot.id)) {
              advanceAlertedSpotIdsRef.current.add(spot.id);

              if (settings.soundEnabled) playAlertChime();
              if (settings.vibrationEnabled) triggerVibration([150, 100, 150]);

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

          // 2. 正式到期
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
                    body: `${spot.name} 5 分鐘重生完畢！可立即登入派兵討伐！`,
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

  // 前景喚醒立即檢查跨日
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
      setSpots((prev) =>
        prev.map((s) => (s.id === editingSpot.id ? { ...s, ...spotData, updatedAt: Date.now() } : s))
      );
      setEditingSpot(null);
    } else {
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

  // 更新卡片狀態
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

  return (
    <div className="min-h-screen flex flex-col bg-md-background text-md-on-background transition-colors duration-200">
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 space-y-4">
        {/* 電腦版寬螢幕專屬 Material 3 儀表板橫列 */}
        <div className="hidden md:flex items-center justify-between p-4 rounded-3xl border border-md-outline-variant/60 bg-md-surface-container shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-md-primary flex items-center justify-center text-md-on-primary font-bold shadow-sm">
                <Monitor size={16} />
              </div>
              <div>
                <div className="font-bold text-sm text-md-on-surface">Material 3 營運監控儀表板</div>
                <div className="text-[11px] text-md-on-surface-variant font-mono">種子色 Token: #3AC200</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="p-2 rounded-xl bg-md-surface-container-high border border-md-outline-variant/40">
                總點位：<strong className="text-md-on-surface">{spots.length}</strong>
              </span>
              <span className="p-2 rounded-xl bg-md-surface-container-high border border-md-outline-variant/40">
                5分冷卻進行中：<strong className="text-md-primary">{activeCount}</strong>
              </span>
              <span className="p-2 rounded-xl bg-md-primary-container text-md-on-primary-container font-bold">
                已重生可進攻：{readyCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-md-on-surface-variant">
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-md-primary" />
              <span>深淺色自適應 · 跨日00:00自動重置</span>
            </span>
          </div>
        </div>

        {/* 快捷篩選標籤列與操作按鈕 */}
        <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-md-outline-variant/50 bg-md-surface-container-high shadow-sm">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-md-primary text-md-on-primary shadow-sm'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              全部 ({spots.length})
            </button>
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterMode === 'active'
                  ? 'bg-md-primary text-md-on-primary shadow-sm'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <Clock size={13} />
              <span>計時中 ({activeCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('ready')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterMode === 'ready'
                  ? 'bg-md-primary text-md-on-primary shadow-sm'
                  : 'text-md-on-surface-variant hover:text-md-on-surface'
              }`}
            >
              <CheckCircle size={13} />
              <span>已出現 ({readyCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingSpot(null);
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3.5 rounded-xl bg-md-primary hover:opacity-90 text-md-on-primary font-bold transition-opacity shadow-sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>新增點位</span>
            </button>
          </div>
        </div>

        {/* 蘑菇卡片網格（電腦版自動變為 2 欄或 3 欄並排網格佈局） */}
        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                onOpenShortcutHelp={() => setIsShortcutModalOpen(true)}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-md-outline-variant rounded-3xl p-6 bg-md-surface-container-low">
            <div className="text-3xl mb-2">🍄</div>
            <div className="text-sm font-bold text-md-on-surface">目前尚無符合條件的蘑菇點位</div>
            <p className="text-xs mt-1 max-w-xs mx-auto text-md-on-surface-variant">
              點擊右上角「新增點位」建立專屬蘑菇點位，或載入示範資料進行體驗。
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleLoadDemoData}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-md-outline-variant bg-md-surface-container hover:bg-md-surface-container-high text-md-on-surface transition-colors"
              >
                載入示範資料
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-md-primary hover:opacity-90 text-md-on-primary rounded-xl text-xs font-bold transition-opacity shadow-sm"
              >
                新增第一個點位
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部資訊列 */}
      <footer className="border-t border-md-outline-variant/40 bg-md-surface-container/60 px-4 py-3.5 text-center text-[11px] space-y-1 transition-colors text-md-on-surface-variant">
        <div className="flex items-center justify-center gap-2 flex-wrap font-medium">
          <span>皮克敏蘑菇追蹤儀表板</span>
          <span>·</span>
          <span>Material 3 Seed: #3AC200</span>
          <span>·</span>
          <span>5 分鐘極速重生</span>
          <span>·</span>
          <span>提前 1~3 分鐘預警</span>
          <span>·</span>
          <span>三大蘑菇體系管理</span>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button onClick={() => setIsGuideOpen(true)} className="hover:underline">
            使用指南與平台設定
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
            className="text-md-error hover:underline"
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

      <ShortcutModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
export default App;
