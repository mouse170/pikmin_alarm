import React, { useState } from 'react';
import { MushroomSpot, MushroomColor } from '../types/mushroom';
import { Clock, Calendar, CheckCircle2, Swords, RefreshCw, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { exportMushroomToCalendar } from '../utils/ics';

interface MushroomCardProps {
  spot: MushroomSpot;
  currentTime: number;
  onUpdateSpot: (updated: MushroomSpot) => void;
  onDeleteSpot: (id: string) => void;
  onEditSpot: (spot: MushroomSpot) => void;
  theme?: 'oled' | 'light';
}

const COLOR_MAP: Record<MushroomColor, { label: string; bg: string; text: string; border: string }> = {
  red: { label: '紅色', bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-900/60' },
  blue: { label: '藍色', bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-900/60' },
  yellow: { label: '黃色', bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-900/60' },
  purple: { label: '紫色', bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-900/60' },
  white: { label: '白色', bg: 'bg-slate-900/60', text: 'text-slate-200', border: 'border-slate-700/60' },
  rock: { label: '岩石', bg: 'bg-zinc-900/60', text: 'text-zinc-300', border: 'border-zinc-700/60' },
  winged: { label: '羽翼', bg: 'bg-pink-950/40', text: 'text-pink-400', border: 'border-pink-900/60' },
  fire: { label: '烈火', bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-900/60' },
  water: { label: '水流', bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-900/60' },
  electric: { label: '電力', bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-900/60' },
  poison: { label: '劇毒', bg: 'bg-lime-950/40', text: 'text-lime-400', border: 'border-lime-900/60' },
  mystery: { label: '神秘', bg: 'bg-teal-950/40', text: 'text-teal-400', border: 'border-teal-900/60' },
  giant: { label: '巨大', bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-900/60' },
  special: { label: '特殊', bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-400', border: 'border-fuchsia-900/60' },
};

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
  const colorConfig = COLOR_MAP[spot.color] || COLOR_MAP.red;

  // 計算冷卻剩餘時間（毫秒）
  let remainingMs = 0;
  let progressPercent = 0;
  let isCooldown = false;
  let isBattling = false;
  let isReady = spot.status === 'ready';

  if (spot.status === 'cooldown' && spot.cooldownEndTime) {
    remainingMs = Math.max(0, spot.cooldownEndTime - currentTime);
    isCooldown = true;
    const totalDuration = 15 * 60 * 1000;
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

  // 啟動 15 分鐘擊破重生倒數
  const handleStartCooldown = (minutes = 15) => {
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
      title: `${spot.name} (${colorConfig.label})`,
      notes: spot.notes,
      targetTimeMs: targetMs,
    });
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all p-4 ${
        isLight
          ? isReady
            ? 'border-emerald-500 bg-emerald-50/70 shadow-md'
            : isCooldown
            ? 'border-amber-200 bg-white shadow-sm'
            : isBattling
            ? 'border-indigo-200 bg-white shadow-sm'
            : 'border-slate-200 bg-white shadow-sm'
          : isReady
          ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/10'
          : isCooldown
          ? 'border-neutral-800 bg-oled-card hover:border-neutral-700'
          : isBattling
          ? 'border-indigo-900/50 bg-oled-card hover:border-indigo-800'
          : 'border-neutral-900 bg-oled-card'
      }`}
    >
      {/* 卡片標頭：名稱、顏色標籤、選單按鈕 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
            >
              {colorConfig.label}蘑菇
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
          {spot.notes && (
            <p className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
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
              onClick={() => handleStartCooldown(15)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              打完 +15m
            </button>
          </div>
        ) : isCooldown ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                <Clock size={14} className="animate-spin-slow" />
                <span>15 分鐘重生倒數中</span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                預計 {formatTargetClock(spot.cooldownEndTime!)} 重生
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-black font-mono tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
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
                title="加入手機系統行事曆鬧鐘"
              >
                <Calendar size={12} />
                <span>行事曆提醒</span>
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
                  onClick={() => handleStartCooldown(15)}
                  className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                  title="提早擊破並開始 15 分鐘重生冷卻"
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
              點擊下方按鈕啟動計時
            </span>
          </div>
        )}
      </div>

      {/* 快捷操作按鈕列 */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button
          onClick={() => handleStartCooldown(15)}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all shadow-sm active:scale-[0.98] ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
          }`}
        >
          <Clock size={14} className="text-amber-500" />
          <span>剛打完 (15分)</span>
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
