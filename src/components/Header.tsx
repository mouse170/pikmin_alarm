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
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-all duration-300 ${
        isLight
          ? 'bg-white/90 border-b border-[#D6E5D0] shadow-[0_4px_20px_rgba(46,155,15,0.06)] text-[#182B1B]'
          : 'bg-black/90 dark:bg-black/95 border-b border-tactical-border/70 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col gap-2">
        {/* 第一列：品牌識別、狀態指示與主要操作群 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左側：戰術/花園識別徽章與標題 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 duration-200 flex-shrink-0 ${
                isLight
                  ? 'bg-gradient-to-br from-[#38B715] to-[#24800B] text-white shadow-md shadow-[#2E9B0F]/25 ring-2 ring-white/80'
                  : 'bg-tactical-green/15 text-tactical-green ring-1 ring-tactical-green/30 shadow-[0_0_12px_rgba(134,219,112,0.2)]'
              }`}
            >
              <Compass size={18} className={isLight ? 'text-white' : 'text-tactical-green'} />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-display font-extrabold text-sm sm:text-base tracking-tight truncate">
                  皮克敏蘑菇追蹤
                </span>
                <span
                  className={`font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                    isLight
                      ? 'bg-[#E3F2DF] text-[#24800B] border border-[#C5E8BA]'
                      : 'bg-tactical-moss border border-tactical-border text-tactical-green'
                  }`}
                >
                  Bloom Radar
                </span>
                {weekendActive && (
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse ${
                      isLight
                        ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
                        : 'bg-tactical-crimson/20 text-tactical-crimson border border-tactical-crimson/30'
                    }`}
                  >
                    <Sparkles size={10} />
                    <span>週末巨型菇</span>
                  </span>
                )}
              </div>
              <span className={`hidden sm:inline font-mono text-[11px] ${isLight ? 'text-[#556B58]' : 'text-zinc-400'}`}>
                {isLight ? 'Day Garden Explorer HUD' : 'Pikmin Bloom Tactical HUD'}
              </span>
            </div>
          </div>

          {/* 右側操作群 */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* 主題切換 */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={isLight ? '切換至 OLED 純黑深色模式' : '切換至日間花園明亮模式'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 duration-150 ${
                isLight
                  ? 'bg-white border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B] hover:bg-[#F4F8F1] shadow-sm'
                  : 'bg-zinc-900 border-tactical-border text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              aria-label="切換主題"
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* 推播提醒開關 */}
            <button
              type="button"
              onClick={onRequestNotificationPermission}
              title={notificationsEnabled ? '推播通知已啟用（含 1~3 分鐘預警）' : '點擊啟用通知'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 duration-150 ${
                notificationsEnabled
                  ? isLight
                    ? 'bg-[#DCF5D6] text-[#18450c] border-[#BCE7B4] shadow-sm shadow-[#2E9B0F]/20'
                    : 'bg-tactical-green/15 text-tactical-green border-tactical-green/40 shadow-[0_0_10px_rgba(134,219,112,0.2)]'
                  : isLight
                  ? 'bg-white border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B]'
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
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 duration-150 ${
                isLight
                  ? 'bg-white border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B] hover:bg-[#F4F8F1] shadow-sm'
                  : 'bg-zinc-900 border-tactical-border text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>HUD</span>
            </button>

            {/* 新增點位主要按鈕 */}
            <button
              type="button"
              onClick={onOpenNewModal}
              className={`flex items-center gap-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full font-display text-xs sm:text-sm font-bold transition-all hover:scale-105 active:scale-95 duration-150 ${
                isLight
                  ? 'bg-[#2E9B0F] hover:bg-[#25820C] text-white shadow-md shadow-[#2E9B0F]/25 hover:shadow-lg'
                  : 'bg-tactical-green text-black hover:bg-tactical-green/90 shadow-[0_0_14px_rgba(134,219,112,0.35)]'
              }`}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>新增點位</span>
            </button>
          </div>
        </div>

        {/* 第二列：額度膠囊儀表（自適應雙模式） */}
        <div
          className={`flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl border transition-colors duration-300 ${
            isLight
              ? 'bg-white/95 border-[#D6E5D0] shadow-sm text-[#182B1B]'
              : 'bg-zinc-950/80 border-tactical-border/60 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              className={`font-mono text-[11px] flex items-center gap-1.5 whitespace-nowrap ${
                isLight ? 'text-[#556B58]' : 'text-zinc-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isLight ? 'bg-[#2E9B0F]' : 'bg-tactical-green'
                }`}
              />
              <span>今日剩餘額度</span>
            </span>

            {/* 額度指示燈 (1, 2, 3) */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => {
                const isAvailable = num <= quota.remaining;
                return (
                  <span
                    key={num}
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-200 ${
                      isAvailable
                        ? isLight
                          ? 'bg-[#2E9B0F] text-white shadow-sm shadow-[#2E9B0F]/30 scale-105'
                          : 'bg-tactical-green text-black shadow-[0_0_8px_rgba(134,219,112,0.4)]'
                        : isLight
                        ? 'bg-[#E5EFE2] text-[#8FA590] border border-[#D6E5D0]'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
            </div>

            <span
              className={`font-mono text-xs font-bold whitespace-nowrap ${
                isLight ? 'text-[#24800B]' : 'text-tactical-green'
              }`}
            >
              ({quota.remaining}/3)
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => onUpdateQuota(-1)}
              disabled={quota.remaining <= 0}
              className={`px-2 py-1 rounded-lg border font-mono text-[11px] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                isLight
                  ? 'bg-[#F4F8F1] hover:bg-[#E8F2E4] border-[#D6E5D0] text-[#182B1B]'
                  : 'bg-zinc-900 border-tactical-border hover:bg-zinc-800 text-zinc-200'
              }`}
              title="消耗一次進攻額度"
            >
              -1次
            </button>
            <button
              type="button"
              onClick={() => onUpdateQuota(1)}
              disabled={quota.remaining >= 3}
              className={`px-2 py-1 rounded-lg border font-mono text-[11px] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                isLight
                  ? 'bg-[#F4F8F1] hover:bg-[#E8F2E4] border-[#D6E5D0] text-[#182B1B]'
                  : 'bg-zinc-900 border-tactical-border hover:bg-zinc-800 text-zinc-200'
              }`}
              title="恢復一次進攻額度"
            >
              +1恢復
            </button>
            <span
              className={`hidden sm:inline font-mono text-[10px] pl-1 ${
                isLight ? 'text-[#556B58]' : 'text-zinc-500'
              }`}
            >
              跨日 00:00 自動重置
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
