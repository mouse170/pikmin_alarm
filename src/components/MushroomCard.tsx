import React, { useState } from 'react';
import { MushroomSpot } from '../types/mushroom';
import { Clock, CheckCircle2, Swords, RefreshCw, MoreVertical, Trash2, Edit2, AlertTriangle, Hourglass, Sparkles } from 'lucide-react';
import { getMushroomMeta, isWeekend } from '../utils/mushroomData';

interface MushroomCardProps {
  spot: MushroomSpot;
  currentTime: number;
  onUpdateSpot: (updated: MushroomSpot) => void;
  onDeleteSpot: (id: string) => void;
  onEditSpot: (spot: MushroomSpot) => void;
  theme?: 'oled' | 'light';
}

export const MushroomCard: React.FC<MushroomCardProps> = ({
  spot,
  currentTime,
  onUpdateSpot,
  onDeleteSpot,
  onEditSpot,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [showCustomBattleInput, setShowCustomBattleInput] = useState(false);

  const meta = getMushroomMeta(spot.typeId);
  const weekendActive = isWeekend();

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
    const assumedBattleDuration = 60 * 60 * 1000;
    progressPercent = Math.min(100, Math.max(0, ((assumedBattleDuration - remainingMs) / assumedBattleDuration) * 100));
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

  // 重設為閒置待命狀態
  const handleReset = () => {
    onUpdateSpot({
      ...spot,
      status: 'idle',
      cooldownEndTime: null,
      battleEndTime: null,
      updatedAt: Date.now(),
    });
  };

  return (
    <article className="flex flex-col justify-between rounded-2xl bg-zinc-950 border border-tactical-border/70 p-4 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-tactical-green/40 hover:bg-zinc-900/90">
      {/* 頂部狀態細邊（即時反映蘑菇狀態） */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
          isReady
            ? 'bg-tactical-green shadow-[0_0_12px_rgba(134,219,112,0.9)]'
            : isApproaching
            ? 'bg-tactical-amber shadow-[0_0_10px_rgba(255,186,39,0.7)]'
            : isCooldown
            ? 'bg-tactical-crimson'
            : isBattling
            ? 'bg-tactical-amber'
            : 'bg-zinc-800'
        }`}
      />

      <div className="space-y-3">
        {/* 卡片標頭：分類體系、屬性限定色標、名稱與管理選單 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {/* 分類標籤 */}
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                {meta.categoryName}
              </span>

              {/* 屬性色標 */}
              <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}>
                {meta.name}
              </span>

              {/* 尺寸標籤 */}
              {spot.size && spot.size !== 'normal' && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800 font-bold">
                  {spot.size === 'giant' ? '巨大' : '大'}
                </span>
              )}

              {/* 活動菇週末限定識別 */}
              {spot.category === 'event' && spot.typeId === 'event_giant' && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-tactical-crimson/15 text-tactical-crimson border border-tactical-crimson/30 flex items-center gap-1 font-semibold">
                  <Sparkles size={9} />
                  <span>{weekendActive ? '週末進行中' : '週末限定'}</span>
                </span>
              )}
            </div>

            <h3 className="font-display text-base font-bold tracking-tight text-white truncate">
              {spot.name}
            </h3>

            {/* 元素菇限定派遣提示（UI 自解釋 UX 規則） */}
            {meta.dispatchRule && (
              <div className="mt-1.5 p-1.5 px-2 rounded-lg bg-zinc-900/90 border border-tactical-amber/30 flex items-start gap-1.5 shadow-inner">
                <AlertTriangle size={13} className="text-tactical-amber flex-shrink-0 mt-0.5" />
                <p className="font-mono text-[11px] text-tactical-amber leading-tight">
                  <span className="font-bold">限定派遣：{meta.dispatchRule}</span>
                </p>
              </div>
            )}

            {spot.notes && (
              <p className="font-mono text-[11px] text-zinc-400 truncate mt-1">
                {spot.notes}
              </p>
            )}
          </div>

          {/* 更多管理選單 */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="選項選單"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 rounded-xl border border-tactical-border bg-zinc-900 text-white shadow-2xl py-1 z-30 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEditSpot(spot);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200"
                >
                  <Edit2 size={13} className="text-zinc-400" />
                  <span>編輯點位</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    handleReset();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-zinc-200"
                >
                  <RefreshCw size={13} className="text-zinc-400" />
                  <span>重設狀態</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteSpot(spot.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 flex items-center gap-2 text-tactical-crimson"
                >
                  <Trash2 size={13} />
                  <span>刪除點位</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 內凹感應井（Recessed Sensor Well）：呈現純 UX 狀態邏輯 */}
        <div className="rounded-xl bg-tactical-well border border-tactical-border/60 p-3.5 flex flex-col gap-2 shadow-inner relative">
          {isReady ? (
            /* 狀態 A：已重生可進攻 */
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-tactical-green flex items-center justify-center text-black shadow-md flex-shrink-0">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-sm font-bold text-tactical-green">
                    已重生出現！
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 truncate">
                    冷卻完成 · 可立即派隊進攻搶位
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleStartCooldown(5)}
                className="px-3 py-1.5 rounded-lg bg-tactical-green hover:bg-tactical-green/90 text-black font-display text-xs font-bold shadow-[0_0_12px_rgba(134,219,112,0.35)] transition-all flex-shrink-0"
              >
                打完 +5m
              </button>
            </div>
          ) : isCooldown ? (
            /* 狀態 B：5 分鐘冷卻倒數中（含 1~3 分鐘預警） */
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1.5 text-tactical-cyan font-mono text-xs">
                  <Hourglass size={14} className="animate-spin-slow" />
                  <span>5 分鐘重生倒數中</span>
                </div>
                {isApproaching ? (
                  <span className="px-2 py-0.5 rounded-full bg-tactical-amber/20 text-tactical-amber font-mono text-[10px] font-semibold flex items-center gap-1 border border-tactical-amber/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-tactical-amber"></span>
                    <span>即將出現 (1~3分) · 請開啟遊戲準備進場</span>
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-zinc-400">
                    預計 {formatTargetClock(spot.cooldownEndTime!)} 重生
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      isApproaching
                        ? 'text-tactical-amber drop-shadow-[0_0_8px_rgba(255,186,39,0.5)]'
                        : 'text-tactical-cyan drop-shadow-[0_0_8px_rgba(148,204,255,0.4)]'
                    }`}
                  >
                    {formatRemaining(remainingMs)}
                  </span>
                  {isApproaching && (
                    <span className="font-mono text-[10px] text-zinc-400">
                      預計 {formatTargetClock(spot.cooldownEndTime!)}
                    </span>
                  )}
                </div>

                <span className="font-mono text-[11px] text-tactical-green bg-tactical-green/15 px-1.5 py-0.5 rounded border border-tactical-green/30">
                  {progressPercent.toFixed(1)}%
                </span>
              </div>

              {/* 髮絲進度條（Hairline Progress Line） */}
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-tactical-green shadow-[0_0_8px_rgba(134,219,112,0.8)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : isBattling ? (
            /* 狀態 C：戰鬥進行中 */
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-tactical-amber font-mono text-xs">
                  <Swords size={14} className="animate-pulse" />
                  <span>正在戰鬥中</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  預計 {formatTargetClock(spot.battleEndTime!)} 結束
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-tactical-amber tracking-tight drop-shadow-[0_0_8px_rgba(255,186,39,0.35)]">
                  {formatRemaining(remainingMs)}
                </span>

                <button
                  type="button"
                  onClick={() => handleStartCooldown(5)}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-tactical-border text-zinc-200 hover:bg-zinc-800 font-mono text-[11px] transition-colors"
                  title="提早擊破並切換至 5 分鐘重生冷卻"
                >
                  提早打完
                </button>
              </div>

              {/* 戰鬥進度條 */}
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-tactical-amber shadow-[0_0_8px_rgba(255,186,39,0.7)] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (remainingMs / (60 * 60 * 1000)) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            /* 狀態 D：待命中 */
            <div className="flex items-center justify-between text-xs py-1 text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                <span>目前狀態：待命中</span>
              </span>
              <span className="text-[11px] text-zinc-500">點擊下方按鈕啟動 5 分鐘重生或自訂戰鬥</span>
            </div>
          )}
        </div>
      </div>

      {/* 底部快速操作網格 */}
      <div className="grid grid-cols-2 gap-2 pt-3">
        <button
          type="button"
          onClick={() => handleStartCooldown(5)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-tactical-border text-zinc-200 font-mono text-xs transition-all active:scale-95 shadow-sm"
        >
          <Clock size={13} className="text-tactical-green" />
          <span>剛打完 (5分)</span>
        </button>

        <button
          type="button"
          onClick={() => setShowCustomBattleInput(!showCustomBattleInput)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-tactical-border text-zinc-200 font-mono text-xs transition-all active:scale-95 shadow-sm"
        >
          <Swords size={13} className="text-tactical-amber" />
          <span>正在打 (自訂)</span>
        </button>
      </div>

      {/* 展開之自訂戰鬥時間面板 */}
      {showCustomBattleInput && (
        <div className="mt-2.5 p-3 rounded-xl bg-zinc-900 border border-tactical-border text-xs font-mono">
          <div className="mb-2 text-zinc-400">
            設定預計戰鬥所需時間：
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[15, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleStartBattling(mins)}
                className="py-1 px-1 rounded-lg border border-tactical-border bg-black text-zinc-200 hover:bg-zinc-800 text-center transition-colors"
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
              className="flex-1 rounded-lg px-2.5 py-1 font-mono text-xs bg-black border border-tactical-border text-white focus:outline-none focus:border-tactical-green"
              placeholder="分鐘"
            />
            <span className="text-zinc-400">分鐘</span>
            <button
              type="button"
              onClick={() => handleStartBattling(customMinutes)}
              className="px-3 py-1 bg-tactical-green text-black rounded-lg font-bold text-xs transition-transform active:scale-95 shadow-sm"
            >
              啟動
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
