import React, { useState } from 'react';
import { MushroomSpot } from '../types/mushroom';
import { Clock, CheckCircle2, Swords, RefreshCw, MoreVertical, Trash2, Edit2, AlertCircle, Zap, HelpCircle } from 'lucide-react';
import { getMushroomMeta } from '../utils/mushroomData';
import { isIOS, triggerIOSShortcutTimer } from '../utils/device';

interface MushroomCardProps {
  spot: MushroomSpot;
  currentTime: number;
  onUpdateSpot: (updated: MushroomSpot) => void;
  onDeleteSpot: (id: string) => void;
  onEditSpot: (spot: MushroomSpot) => void;
  onOpenShortcutHelp?: () => void;
  theme?: 'oled' | 'light';
}

export const MushroomCard: React.FC<MushroomCardProps> = ({
  spot,
  currentTime,
  onUpdateSpot,
  onDeleteSpot,
  onEditSpot,
  onOpenShortcutHelp,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [showCustomBattleInput, setShowCustomBattleInput] = useState(false);

  const meta = getMushroomMeta(spot.typeId);
  const isAppleDevice = isIOS();

  // 計算冷卻剩餘時間（毫秒），預設冷卻為 5 分鐘
  let remainingMs = 0;
  let progressPercent = 0;
  let isCooldown = false;
  let isBattling = false;
  let isReady = spot.status === 'ready';

  if (spot.status === 'cooldown' && spot.cooldownEndTime) {
    remainingMs = Math.max(0, spot.cooldownEndTime - currentTime);
    isCooldown = true;
    const totalDuration = 5 * 60 * 1000;
    progressPercent = Math.min(100, Math.max(0, ((totalDuration - remainingMs) / totalDuration) * 100));
    if (remainingMs <= 0) {
      isReady = true;
      isCooldown = false;
    }
  } else if (spot.status === 'battling' && spot.battleEndTime) {
    remainingMs = Math.max(0, spot.battleEndTime - currentTime);
    isBattling = true;
    if (remainingMs <= 0) {
      isReady = true;
      isBattling = false;
    }
  }

  // 判定是否進入 1~3 分鐘提前預警區間
  const isApproaching = remainingMs > 0 && remainingMs <= 3 * 60 * 1000;

  // 格式化剩餘時間 MM:SS 或 HH:MM:SS
  const formatRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatTargetClock = (timeMs: number) => {
    const date = new Date(timeMs);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  // 啟動 5 分鐘擊破重生倒數
  const handleStartCooldown = (minutes = 5) => {
    const cooldownEndTime = Date.now() + minutes * 60 * 1000;
    onUpdateSpot({
      ...spot,
      status: 'cooldown',
      cooldownEndTime,
      battleEndTime: null,
      updatedAt: Date.now(),
    });
  };

  // 啟動正在打倒數
  const handleStartBattling = (minutes: number) => {
    const battleEndTime = Date.now() + minutes * 60 * 1000;
    onUpdateSpot({
      ...spot,
      status: 'battling',
      battleEndTime,
      cooldownEndTime: null,
      updatedAt: Date.now(),
    });
    setShowCustomBattleInput(false);
  };

  // 重設為閒置狀態
  const handleReset = () => {
    onUpdateSpot({
      ...spot,
      status: 'idle',
      cooldownEndTime: null,
      battleEndTime: null,
      updatedAt: Date.now(),
    });
  };

  // 喚醒 iOS 原生捷徑計時器
  const handleTriggerShortcut = () => {
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    triggerIOSShortcutTimer(remainingMinutes || 5);
  };

  return (
    <div
      className={`relative rounded-3xl border transition-all p-4 shadow-sm flex flex-col justify-between ${
        isReady
          ? 'bg-md-primary-container text-md-on-primary-container border-md-primary/60 shadow-md ring-1 ring-md-primary/40'
          : isApproaching
          ? 'bg-md-surface-container border-amber-500/60 ring-2 ring-amber-500/40'
          : isCooldown
          ? 'bg-md-surface-container border-md-outline-variant/60 hover:border-md-primary/50'
          : isBattling
          ? 'bg-md-surface-container border-md-secondary/40'
          : 'bg-md-surface-container-low border-md-outline-variant/40'
      }`}
    >
      <div>
        {/* 卡片標頭：分類標籤、名稱、功能選單 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {/* 分類標籤 */}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-md-surface-container-highest text-md-on-surface-variant border border-md-outline-variant/40">
                {meta.categoryName}
              </span>

              {/* 具體屬性色標 */}
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}>
                {meta.name}
              </span>

              {spot.size && spot.size !== 'normal' && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-md-surface-container-high text-md-on-surface border border-md-outline-variant/40">
                  {spot.size === 'giant' ? '巨大' : '大'}
                </span>
              )}

              <h3 className="text-sm font-bold truncate text-md-on-surface">
                {spot.name}
              </h3>
            </div>

            {/* 限定派遣皮克敏提示（元素菇專屬） */}
            {meta.dispatchRule && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-1">
                <span>⚠️ 限定：</span>
                <span>{meta.dispatchRule}</span>
              </div>
            )}

            {spot.notes && (
              <p className="text-xs truncate text-md-on-surface-variant">
                {spot.notes}
              </p>
            )}
          </div>

          {/* 更多功能選單 */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-xl text-md-on-surface-variant hover:text-md-on-surface hover:bg-md-surface-variant transition-colors"
              aria-label="選單"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 rounded-2xl border border-md-outline-variant/60 bg-md-surface-container-high text-md-on-surface shadow-2xl py-1.5 z-20 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditSpot(spot);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-md-surface-variant flex items-center gap-2"
                >
                  <Edit2 size={13} className="text-md-outline" />
                  <span>編輯點位</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleReset();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-md-surface-variant flex items-center gap-2"
                >
                  <RefreshCw size={13} className="text-md-outline" />
                  <span>重設狀態</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteSpot(spot.id);
                  }}
                  className="w-full text-left px-3.5 py-2 text-md-error hover:bg-md-error-container/20 flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  <span>刪除點位</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 狀態展示區 */}
        <div className="my-3 py-2.5 px-3.5 rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-highest/60 flex items-center justify-between">
          {isReady ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={22} className="text-md-primary animate-pulse" />
                <div>
                  <div className="text-sm font-bold text-md-on-primary-container">已重生出現！</div>
                  <div className="text-[11px] opacity-80">可立即派兵進攻</div>
                </div>
              </div>
              <button
                onClick={() => handleStartCooldown(5)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-md-primary text-md-on-primary hover:opacity-90 shadow-sm transition-opacity"
              >
                打完 +5m
              </button>
            </div>
          ) : isCooldown ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                  <Clock size={14} className="animate-spin-slow" />
                  <span>5 分鐘重生倒數中</span>
                  {isApproaching && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/40 animate-pulse">
                      <AlertCircle size={10} />
                      <span>即將出現 (1~3分)</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-md-on-surface-variant">
                  預計 {formatTargetClock(spot.cooldownEndTime!)} 重生
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-2xl font-black font-mono tracking-tight ${isApproaching ? 'text-amber-500 animate-pulse' : 'text-md-primary'}`}>
                  {formatRemaining(remainingMs)}
                </span>

                {/* iOS 設備專屬捷徑按鈕 */}
                {isAppleDevice && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleTriggerShortcut}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold bg-md-secondary-container text-md-on-secondary-container border border-md-secondary/30 hover:opacity-90 transition-opacity shadow-sm"
                      title="呼叫 iOS 捷徑開始原生時鐘倒數"
                    >
                      <Zap size={12} className="text-md-primary" />
                      <span>捷徑計時</span>
                    </button>
                    {onOpenShortcutHelp && (
                      <button
                        onClick={onOpenShortcutHelp}
                        className="p-1 text-md-outline hover:text-md-primary transition-colors"
                        title="查看 iOS 捷徑設定教學"
                      >
                        <HelpCircle size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* 倒數進度條 */}
              <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden bg-md-surface-container">
                <div
                  className="h-full bg-md-primary transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : isBattling ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs text-md-tertiary font-semibold">
                  <Swords size={14} />
                  <span>正在戰鬥中</span>
                </div>
                <div className="text-[11px] text-md-on-surface-variant">
                  預計 {formatTargetClock(spot.battleEndTime!)} 結束
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono tracking-tight text-md-tertiary">
                  {formatRemaining(remainingMs)}
                </span>
                <div className="flex items-center gap-1.5">
                  {isAppleDevice && (
                    <button
                      onClick={handleTriggerShortcut}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold bg-md-secondary-container text-md-on-secondary-container border border-md-secondary/30 hover:opacity-90 transition-opacity shadow-sm"
                      title="呼叫 iOS 捷徑開始原生時鐘倒數"
                    >
                      <Zap size={12} className="text-md-primary" />
                      <span>捷徑計時</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleStartCooldown(5)}
                    className="px-2.5 py-1 rounded-lg text-[11px] border border-md-outline-variant bg-md-surface text-md-on-surface hover:bg-md-surface-container transition-colors"
                    title="提早擊破並開始 5 分鐘重生冷卻"
                  >
                    提早打完
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-xs py-0.5 text-md-on-surface-variant">
              <span>目前狀態：空閒中</span>
              <span className="opacity-70">點擊下方啟動 5 分鐘重生倒數</span>
            </div>
          )}
        </div>
      </div>

      {/* 快捷操作按鈕列 */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => handleStartCooldown(5)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-md-outline-variant/60 bg-md-surface-container-high hover:bg-md-surface-variant text-md-on-surface text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <Clock size={14} className="text-md-primary" />
          <span>剛打完 (5分)</span>
        </button>

        <button
          onClick={() => setShowCustomBattleInput(!showCustomBattleInput)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-md-outline-variant/60 bg-md-surface-container-high hover:bg-md-surface-variant text-md-on-surface text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <Swords size={14} className="text-md-tertiary" />
          <span>正在打 (自訂)</span>
        </button>
      </div>

      {/* 展開之戰鬥時間自訂區塊 */}
      {showCustomBattleInput && (
        <div className="mt-2.5 p-3 rounded-2xl border border-md-outline-variant/60 bg-md-surface-container-high text-xs">
          <div className="mb-2 font-medium text-md-on-surface-variant">
            設定預計戰鬥所需時間：
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[15, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleStartBattling(mins)}
                className="py-1 px-1.5 rounded-xl border border-md-outline-variant bg-md-surface text-md-on-surface hover:bg-md-surface-container font-mono text-center transition-colors"
              >
                {mins >= 60 ? `${mins / 60} 小時` : `${mins} 分鐘`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="1440"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 rounded-xl px-3 py-1 font-mono text-xs focus:outline-none border border-md-outline-variant bg-md-surface text-md-on-surface focus:border-md-primary"
              placeholder="分鐘"
            />
            <span className="text-md-on-surface-variant">分鐘</span>
            <button
              onClick={() => handleStartBattling(customMinutes)}
              className="px-3.5 py-1 bg-md-primary hover:opacity-90 text-md-on-primary rounded-xl font-bold text-xs transition-opacity shadow-sm"
            >
              啟動
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
