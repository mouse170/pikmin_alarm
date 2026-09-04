import React from 'react';
import { DailyQuota } from '../types/mushroom';
import { isWeekend } from '../utils/mushroomData';
import { Sparkles, Moon, Sun, Bell, BellOff, Compass, Plus } from 'lucide-react';

interface HeaderProps {
  quota: DailyQuota;
  onUpdateQuota: (delta: number) => void;
  onOpenNewModal: () => void;
  onOpenOledHud: () => void;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
  theme: 'oled' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quota,
  onUpdateQuota,
  onOpenNewModal,
  onOpenOledHud,
  notificationsEnabled,
  onRequestNotificationPermission,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';
  const weekendActive = isWeekend();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-tactical-border/70 bg-black/90 dark:bg-black/95 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2">
        {/* 第一列：品牌識別、狀態指示與主要操作群 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左側：戰術識別徽章與標題 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-tactical-green/15 text-tactical-green flex items-center justify-center ring-1 ring-tactical-green/30 shadow-[0_0_12px_rgba(134,219,112,0.2)] flex-shrink-0">
              <Compass size={18} className="text-tactical-green" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white dark:text-white truncate">
                  皮克敏蘑菇追蹤
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-tactical-moss border border-tactical-border text-tactical-green">
                  Bloom Radar
                </span>
                {weekendActive && (
                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-tactical-crimson/20 text-tactical-crimson border border-tactical-crimson/30 flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>週末巨型菇</span>
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
                Pikmin Bloom Tactical HUD
              </span>
            </div>
          </div>

          {/* 右側操作群 */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* 主題切換 */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={isLight ? '切換至 OLED 純黑模式' : '切換至明亮模式'}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 border border-tactical-border text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="切換主題"
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* 推播提醒開關 */}
            <button
              type="button"
              onClick={onRequestNotificationPermission}
              title={notificationsEnabled ? '推播通知已啟用（含 1~3 分鐘預警）' : '點擊啟用通知'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                notificationsEnabled
                  ? 'bg-tactical-green/15 text-tactical-green border-tactical-green/40 shadow-[0_0_10px_rgba(134,219,112,0.2)]'
                  : 'bg-zinc-900 border-tactical-border text-zinc-400 hover:text-zinc-200'
              }`}
              aria-label="切換通知權限"
            >
              {notificationsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
            </button>

            {/* 常亮 HUD 按鈕 */}
            <button
              type="button"
              onClick={onOpenOledHud}
              title="開啟全螢幕常亮 HUD"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-tactical-border text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-mono"
            >
              <span>HUD</span>
            </button>

            {/* 新增點位主要按鈕 */}
            <button
              type="button"
              onClick={onOpenNewModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-tactical-green text-black hover:bg-tactical-green/90 font-display text-xs sm:text-sm font-bold shadow-[0_0_14px_rgba(134,219,112,0.35)] transition-transform active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>新增點位</span>
            </button>
          </div>
        </div>

        {/* 第二列：額度膠囊儀表（行動端緊湊呈現、寬螢幕舒展） */}
        <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl bg-zinc-950/80 border border-tactical-border/60">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse"></span>
              <span>今日剩餘額度</span>
            </span>

            {/* 額度指示燈 (1, 2, 3) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => {
                const isAvailable = num <= quota.remaining;
                return (
                  <span
                    key={num}
                    className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                      isAvailable
                        ? 'bg-tactical-green text-black shadow-[0_0_8px_rgba(134,219,112,0.4)]'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
            </div>

            <span className="font-mono text-xs font-semibold text-tactical-green whitespace-nowrap">
              ({quota.remaining}/3)
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => onUpdateQuota(-1)}
              disabled={quota.remaining <= 0}
              className="px-2 py-1 rounded bg-zinc-900 border border-tactical-border hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 font-mono text-[11px] transition-colors"
              title="消耗一次進攻額度"
            >
              -1次
            </button>
            <button
              type="button"
              onClick={() => onUpdateQuota(1)}
              disabled={quota.remaining >= 3}
              className="px-2 py-1 rounded bg-zinc-900 border border-tactical-border hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 font-mono text-[11px] transition-colors"
              title="恢復一次進攻額度"
            >
              +1恢復
            </button>
            <span className="hidden sm:inline font-mono text-[10px] text-zinc-500 pl-1">
              跨日 00:00 自動重置
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
