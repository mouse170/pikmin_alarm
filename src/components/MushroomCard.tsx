import React, { useState } from 'react';
import { MushroomSpot } from '../types/mushroom';
import { Clock, Calendar, CheckCircle2, Swords, RefreshCw, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { exportMushroomToCalendar } from '../utils/ics';
import { getMushroomMeta } from '../utils/mushroomData';

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
  theme = 'oled',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(60);
  const [showCustomBattleInput, setShowCustomBattleInput] = useState(false);

  const isLight = theme === 'light';
  const meta = getMushroomMeta(spot.typeId);

  // 計算冷卻剩餘時間（毫秒），預設冷卻為 5 分鐘
  let remainingMs = 0;
  let progressPercent = 0;
  let isCooldown = false;
  let isBattling = false;
  let isReady = spot.status === 'ready';

  if (spot.status === 'cooldown' && spot.cooldownEndTime) {
    remainingMs = Math.max(0, spot.cooldownEndTime - currentTime);
    isCooldown = true;
    const totalDuration = 5 * 60 * 1000; // 5 分鐘重生冷卻
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

  // 一鍵匯出行事曆
  const handleCalendarExport = () => {
    const targetMs = isCooldown ? spot.cooldownEndTime : spot.battleEndTime;
    if (!targetMs) return;

    exportMushroomToCalendar({
      title: `${spot.name} (${meta.name})`,
      notes: `${meta.dispatchRule ? `【派遣限制】：${meta.dispatchRule}\n` : ''}${spot.notes || ''}`,
      targetTimeMs: targetMs,
      advanceMinutes: 2, // 提前 2 分鐘（在 1~3 分鐘區間）響鈴
    });
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all p-4 ${
        isLight
          ? isReady
            ? 'border-emerald-500 bg-emerald-50/70 shadow-md'
            : isApproaching
            ? 'border-amber-400 bg-amber-50/50 shadow-md ring-1 ring-amber-300'
            : isCooldown
            ? 'border-amber-200 bg-white shadow-sm'
            : isBattling
            ? 'border-indigo-200 bg-white shadow-sm'
            : 'border-slate-200 bg-white shadow-sm'
          : isReady
          ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/10'
          : isApproaching
          ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/20'
          : isCooldown
          ? 'border-neutral-800 bg-oled-card hover:border-neutral-700'
          : isBattling
          ? 'border-indigo-900/50 bg-oled-card hover:border-indigo-800'
          : 'border-neutral-900 bg-oled-card'
      }`}
    >
      {/* 卡片標頭：分類、名稱、屬性標籤、選單按鈕 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* 分類大標籤 */}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                meta.category === 'color'
                  ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                  : meta.category === 'element'
                  ? 'bg-indigo-950/50 text-indigo-300 border-indigo-700'
                  : 'bg-fuchsia-950/50 text-fuchsia-300 border-fuchsia-700'
              }`}
            >
              {meta.categoryName}
            </span>

            {/* 具體顏色/屬性標籤 */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
            >
              {meta.name}
            </span>

            {spot.size && spot.size !== 'normal' && (
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                {spot.size === 'giant' ? '巨大' : '大'}
              </span>
            )}

            <h3
              className={`text-sm font-bold truncate ${
                isLight ? 'text-slate-900' : 'text-neutral-100'
              }`}
            >
              {spot.name}
            </h3>
          </div>

          {/* 限定派遣皮克敏提示（元素菇專屬） */}
          {meta.dispatchRule && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-1">
              <span>⚠️ 限定：</span>
              <span>{meta.dispatchRule}</span>
            </div>
          )}

          {spot.notes && (
            <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
              {spot.notes}
            </p>
          )}
        </div>

        {/* 更多功能選單按鈕 */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
            }`}
            aria-label="選單"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div
              className={`absolute right-0 mt-1 w-32 rounded-xl border shadow-2xl py-1 z-20 text-xs ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200'
              }`}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEditSpot(spot);
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-800'
                }`}
              >
                <Edit2 size={13} className={isLight ? 'text-slate-500' : 'text-neutral-400'} />
                <span>編輯點位</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleReset();
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-neutral-800'
                }`}
              >
                <RefreshCw size={13} className={isLight ? 'text-slate-500' : 'text-neutral-400'} />
                <span>重設狀態</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteSpot(spot.id);
                }}
                className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={13} />
                <span>刪除點位</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 狀態展示區 */}
      <div
        className={`my-3 py-2.5 px-3 rounded-xl border flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-900'
        }`}
      >
        {isReady ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-500 animate-pulse" />
              <div>
                <div className="text-sm font-bold text-emerald-600">已重生出現！</div>
                <div className="text-[11px] text-emerald-700">可立即派兵進攻</div>
              </div>
            </div>
            <button
              onClick={() => handleStartCooldown(5)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
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
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                預計 {formatTargetClock(spot.cooldownEndTime!)} 重生
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-black font-mono tracking-tight ${
                  isApproaching
                    ? 'text-amber-400 animate-pulse'
                    : isLight
                    ? 'text-slate-900'
                    : 'text-white'
                }`}
              >
                {formatRemaining(remainingMs)}
              </span>
              <button
                onClick={handleCalendarExport}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-indigo-950/30 text-indigo-400 hover:text-indigo-300 border-indigo-900/50'
                }`}
                title="加入手機系統行事曆（含提前 2 分鐘鬧鐘）"
              >
                <Calendar size={12} />
                <span>行事曆提醒 (提早2分)</span>
              </button>
            </div>
            {/* 倒數進度條 */}
            <div
              className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-neutral-900'
              }`}
            >
              <div
                className="h-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : isBattling ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold">
                <Swords size={14} />
                <span>正在戰鬥中</span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                預計 {formatTargetClock(spot.battleEndTime!)} 結束
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-black font-mono tracking-tight ${
                  isLight ? 'text-indigo-900' : 'text-indigo-200'
                }`}
              >
                {formatRemaining(remainingMs)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCalendarExport}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors ${
                    isLight
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                      : 'bg-indigo-950/30 text-indigo-400 hover:text-indigo-300 border-indigo-900/50'
                  }`}
                  title="加入系統行事曆"
                >
                  <Calendar size={12} />
                  <span>提醒</span>
                </button>
                <button
                  onClick={() => handleStartCooldown(5)}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                  title="提早擊破並開始 5 分鐘重生冷卻"
                >
                  提早打完
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between w-full text-xs py-0.5 ${
              isLight ? 'text-slate-500' : 'text-neutral-500'
            }`}
          >
            <span>目前狀態：空閒中</span>
            <span className={isLight ? 'text-slate-400' : 'text-neutral-600'}>
              點擊下方啟動 5 分鐘重生倒數
            </span>
          </div>
        )}
      </div>

      {/* 快捷操作按鈕列 */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => handleStartCooldown(5)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-[0.98] ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
          }`}
        >
          <Clock size={14} className="text-amber-500" />
          <span>剛打完 (5分)</span>
        </button>

        <button
          onClick={() => setShowCustomBattleInput(!showCustomBattleInput)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-[0.98] ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
          }`}
        >
          <Swords size={14} className="text-indigo-500" />
          <span>正在打 (自訂)</span>
        </button>
      </div>

      {/* 展開之戰鬥時間自訂區塊 */}
      {showCustomBattleInput && (
        <div
          className={`mt-2.5 p-3 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <div className={`mb-2 font-medium ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            設定預計戰鬥所需時間：
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[15, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => handleStartBattling(mins)}
                className={`py-1 px-1.5 rounded-lg border font-mono text-center transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                }`}
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
              className={`flex-1 rounded-lg px-2.5 py-1 font-mono text-xs focus:outline-none border ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                  : 'bg-black border-neutral-800 text-neutral-100 focus:border-indigo-500'
              }`}
              placeholder="分鐘"
            />
            <span className={isLight ? 'text-slate-500' : 'text-neutral-500'}>分鐘</span>
            <button
              onClick={() => handleStartBattling(customMinutes)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              啟動
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
