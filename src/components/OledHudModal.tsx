import React, { useState, useEffect } from 'react';
import { MushroomSpot } from '../types/mushroom';
import { Moon, X, Clock, Sparkles } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';

interface OledHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  spots: MushroomSpot[];
  currentTime: number;
}

export const OledHudModal: React.FC<OledHudModalProps> = ({
  isOpen,
  onClose,
  spots,
  currentTime,
}) => {
  // 保持螢幕常亮
  const { isLocked } = useWakeLock(isOpen);

  // 防烙印像素位移（Pixel Shift）：每 45 秒隨機微調 -6px 到 +6px
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const randomX = Math.floor(Math.random() * 13) - 6;
      const randomY = Math.floor(Math.random() * 13) - 6;
      setOffset({ x: randomX, y: randomY });
    }, 45000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // 尋找最近到期（最優先需要注意）的蘑菇
  const activeSpots = spots
    .map((spot) => {
      let targetTime = 0;
      let type: 'cooldown' | 'battling' | 'ready' | 'idle' = 'idle';

      if (spot.status === 'cooldown' && spot.cooldownEndTime) {
        targetTime = spot.cooldownEndTime;
        type = targetTime <= currentTime ? 'ready' : 'cooldown';
      } else if (spot.status === 'battling' && spot.battleEndTime) {
        targetTime = spot.battleEndTime;
        type = targetTime <= currentTime ? 'ready' : 'battling';
      } else if (spot.status === 'ready') {
        type = 'ready';
      }

      const diffMs = targetTime > 0 ? Math.max(0, targetTime - currentTime) : 0;
      return { spot, type, targetTime, diffMs };
    })
    .filter((item) => item.type !== 'idle')
    .sort((a, b) => {
      // ready 最優先排前，其餘按剩餘時間由少到多排序
      if (a.type === 'ready' && b.type !== 'ready') return -1;
      if (b.type === 'ready' && a.type !== 'ready') return 1;
      return a.diffMs - b.diffMs;
    });

  const nextUrgent = activeSpots[0];

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

  const formatClock = (ms: number) => {
    const d = new Date(ms);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-neutral-400 select-none flex flex-col justify-between p-6 transition-transform duration-1000 ease-in-out"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        backgroundColor: '#000000',
      }}
    >
      {/* 頂部極簡狀態列 */}
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <Moon size={14} className="text-emerald-500/70 animate-pulse" />
          <span className="font-mono tracking-wider text-[11px]">OLED HUD 常亮省電模式</span>
          {isLocked && (
            <span className="px-1.5 py-0.2 rounded bg-neutral-900 text-emerald-500/80 text-[10px] border border-neutral-800">
              螢幕防休眠中
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full text-neutral-500 hover:text-white bg-neutral-950 border border-neutral-900 transition-colors"
          title="退出 HUD 模式"
        >
          <X size={18} />
        </button>
      </div>

      {/* 主倒數區塊（極簡微光展示） */}
      <div className="flex flex-col items-center justify-center my-auto py-8">
        {nextUrgent ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-900 text-xs text-neutral-400">
              {nextUrgent.type === 'ready' ? (
                <>
                  <Sparkles size={13} className="text-emerald-400 animate-spin" />
                  <span className="text-emerald-400 font-bold">蘑菇已出現！</span>
                </>
              ) : nextUrgent.type === 'cooldown' ? (
                <>
                  <Clock size={13} className="text-amber-500/80" />
                  <span>重生倒數中（預計 {formatClock(nextUrgent.targetTime)}）</span>
                </>
              ) : (
                <>
                  <Clock size={13} className="text-indigo-400/80" />
                  <span>戰鬥進行中（預計 {formatClock(nextUrgent.targetTime)}）</span>
                </>
              )}
            </div>

            <div className="text-xl font-bold text-neutral-200 tracking-tight">
              {nextUrgent.spot.name}
            </div>

            {nextUrgent.type === 'ready' ? (
              <div className="text-5xl md:text-7xl font-black font-mono text-emerald-400 tracking-wider animate-pulse">
                READY!
              </div>
            ) : (
              <div className="text-6xl md:text-8xl font-black font-mono text-neutral-100 tracking-tighter shadow-sm">
                {formatRemaining(nextUrgent.diffMs)}
              </div>
            )}

            <p className="text-xs text-neutral-600">
              {nextUrgent.spot.notes || '維持桌面常亮，時間到達時將發出提示音'}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-4xl">🍄</div>
            <div className="text-neutral-400 text-sm font-medium">目前無進行中的蘑菇倒數</div>
            <p className="text-xs text-neutral-600">點擊卡片啟動倒數後，再開啟此模式放於桌上</p>
          </div>
        )}
      </div>

      {/* 底部其他蘑菇簡約清單 */}
      <div className="border-t border-neutral-900/60 pt-4 max-w-lg mx-auto w-full">
        <div className="text-[11px] text-neutral-600 mb-2 flex items-center justify-between">
          <span>待命蘑菇佇列 ({activeSpots.length})</span>
          <span className="text-[10px] text-neutral-700">自動微位移防烙印</span>
        </div>

        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {activeSpots.slice(1).map((item) => (
            <div
              key={item.spot.id}
              className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-neutral-950/60 border border-neutral-900/40 text-neutral-500"
            >
              <span className="truncate max-w-[180px]">{item.spot.name}</span>
              <span className="font-mono text-neutral-400">
                {item.type === 'ready' ? 'READY' : formatRemaining(item.diffMs)}
              </span>
            </div>
          ))}
          {activeSpots.length <= 1 && (
            <div className="text-[11px] text-neutral-700 text-center py-1">無其他等待中點位</div>
          )}
        </div>
      </div>
    </div>
  );
};
