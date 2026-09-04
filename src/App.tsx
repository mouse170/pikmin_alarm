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
import { Plus, CheckCircle2, Clock, Sparkles, Sprout, Flame, Bell, ShieldCheck } from 'lucide-react';

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
                  new Notification(`蘑菇即將出現：${spot.name}`, {
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
                  new Notification(`蘑菇已出現：${spot.name}`, {
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

  // 切換預警音效開關
  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveSettings(updated);
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
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 transition-colors duration-200">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-5 space-y-4 sm:space-y-5">
        {/* 營運概覽戰術控制艙（Operational Overview Control Deck） */}
        <section className="flex flex-col gap-3">
          {/* 頂部營運橫幅 */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-tactical-border/70 p-4 sm:p-5 shadow-xl">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-tactical-green/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 relative z-10">
              {/* 左側：品牌標誌與 Token 識別 */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-tactical-green/15 flex items-center justify-center text-tactical-green shadow-md flex-shrink-0 ring-1 ring-tactical-green/30">
                  <Sprout size={24} className="text-tactical-green" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-bold text-base sm:text-lg text-white tracking-tight">
                      Material 3 營運監控儀表板
                    </h1>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-tactical-moss border border-tactical-border text-tactical-green font-bold tracking-wider uppercase">
                      Seed: #3AC200
                    </span>
                  </div>
                  <p className="font-mono text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Sparkles size={12} className="text-tactical-green" />
                    <span>皮克敏全天候戰術偵測 · 跨日 00:00 自動同步</span>
                  </p>
                </div>
              </div>

              {/* 右側：狀態度量膠囊群 */}
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-tactical-border text-zinc-300 font-mono text-xs">
                  <span className="text-zinc-400">總點位 :</span>
                  <span className="font-display font-bold text-white text-sm">{spots.length}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-tactical-border text-zinc-300 font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse" />
                  <span className="text-zinc-400">5 分冷卻進行中 :</span>
                  <span className="font-display font-bold text-tactical-cyan text-sm">{activeCount}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tactical-green/15 border border-tactical-green/40 text-tactical-green font-mono text-xs shadow-sm">
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                  <span className="text-zinc-300">已重生可進攻 :</span>
                  <span className="font-display font-bold text-tactical-green text-sm">{readyCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 快捷篩選標籤列與操作按鈕 */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950 border border-tactical-border/70 shadow-inner">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-full font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-tactical-green text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterMode === 'all' ? 'bg-black' : 'bg-zinc-500'}`} />
                <span>全部 ({spots.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1 rounded-full font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMode === 'active'
                    ? 'bg-tactical-green text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Clock size={12} />
                <span>計時中 ({activeCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('ready')}
                className={`px-3 py-1 rounded-full font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterMode === 'ready'
                    ? 'bg-tactical-green text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>已出現 ({readyCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingSpot(null);
                  setIsNewModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tactical-green text-black hover:bg-tactical-green/90 font-display text-xs font-bold shadow-[0_0_12px_rgba(134,219,112,0.3)] transition-transform active:scale-95"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>新增點位</span>
              </button>
            </div>
          </div>
        </section>

        {/* 蘑菇卡片網格（手機 1 欄，平板 2 欄，桌面 3 欄） */}
        {filteredSpots.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
          </section>
        ) : (
          <div className="py-14 text-center border border-dashed border-tactical-border/80 rounded-2xl p-6 bg-zinc-950">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-tactical-border mx-auto flex items-center justify-center text-tactical-green mb-3">
              <Sprout size={24} />
            </div>
            <div className="font-display text-base font-bold text-white">目前尚無符合條件的蘑菇點位</div>
            <p className="font-mono text-xs mt-1 max-w-sm mx-auto text-zinc-400">
              點擊右上角「新增點位」建立專屬蘑菇點位，或載入示範資料進行體驗。
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-3.5 py-1.5 rounded-xl border border-tactical-border bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors"
              >
                載入示範資料
              </button>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="px-3.5 py-1.5 bg-tactical-green hover:bg-tactical-green/90 text-black rounded-xl font-bold transition-transform active:scale-95 shadow-sm"
              >
                新增第一個點位
              </button>
            </div>
          </div>
        )}

        {/* 戰術實況小面板群（Contextual Quick Telemetry Panel） */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* 遠征小隊調度狀態 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-tactical-border/70 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-tactical-border flex items-center justify-center text-tactical-green">
                <ShieldCheck size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-zinc-200">遠征小隊調度狀態</span>
                <span className="font-mono text-[10px] text-zinc-500">目前 40/40 隻皮克敏在編</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-tactical-moss border border-tactical-border text-tactical-green font-bold">
              戰備充足
            </span>
          </div>

          {/* 特殊精華加成加權 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-tactical-border/70 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-tactical-border flex items-center justify-center text-tactical-cyan">
                <Flame size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-zinc-200">特殊精華加成加權</span>
                <span className="font-mono text-[10px] text-zinc-500">今日幸運色：紅色 / 櫻花</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-zinc-900 border border-tactical-border text-tactical-cyan font-bold">
              +1.2x 傷害
            </span>
          </div>

          {/* 即時語音與蜂鳴提醒開關 */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-tactical-border/70 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-tactical-border flex items-center justify-center text-tactical-amber">
                <Bell size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-semibold text-zinc-200">即時倒數預警提示</span>
                <span className="font-mono text-[10px] text-zinc-500">提前 {settings.advanceWarningMinutes || 2} 分鐘提醒</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label="開關倒數提醒音效"
              className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${
                settings.soundEnabled ? 'bg-tactical-green' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black shadow-sm transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>
      </main>

      {/* 底部資訊列 */}
      <footer className="border-t border-tactical-border/60 bg-zinc-950 px-4 py-3.5 text-center font-mono text-[11px] space-y-1 text-zinc-400">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>皮克敏蘑菇追蹤儀表板</span>
          <span>·</span>
          <span>Material 3 Seed: #3AC200</span>
          <span>·</span>
          <span>5 分鐘重生</span>
          <span>·</span>
          <span>提前 1~3 分鐘預警</span>
          <span>·</span>
          <span>三大蘑菇體系管理</span>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1 text-zinc-400">
          <button type="button" onClick={() => setIsGuideOpen(true)} className="hover:text-white transition-colors">
            使用指南與平台設定
          </button>
          <span>·</span>
          <button type="button" onClick={handleLoadDemoData} className="hover:text-white transition-colors">
            重置示範資料
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              if (confirm('確定清空所有點位與自訂資料嗎？')) {
                setSpots([]);
                saveSpots([]);
              }
            }}
            className="text-tactical-crimson hover:underline"
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
