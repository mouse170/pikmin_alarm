import React from 'react';
import { Plus, Moon, Sun, BookOpen, Bell, BellOff } from 'lucide-react';
import { DailyQuota } from '../types/mushroom';

interface HeaderProps {
  quota: DailyQuota;
  onUpdateQuota: (delta: number) => void;
  onOpenNewModal: () => void;
  onOpenOledHud: () => void;
  onOpenGuide: () => void;
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
  onOpenGuide,
  notificationsEnabled,
  onRequestNotificationPermission,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-black/95 border-oled-border text-neutral-100'
      } px-3 py-2.5`}
    >
      <div className="max-w-xl mx-auto space-y-2">
        {/* 第一列：標題列與功能按鈕群 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左側 Logo 與標題（強制單行不換行） */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border shadow-inner ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              🍄
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight whitespace-nowrap truncate">
                皮克敏蘑菇追蹤
              </h1>
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border flex-shrink-0 ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-neutral-900 text-emerald-400 border-neutral-800'
                }`}
              >
                {isLight ? '明亮' : 'OLED'}
              </span>
            </div>
          </div>

          {/* 右側按鈕群（水平橫向整齊排列） */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* 主題切換按鈕 */}
            <button
              onClick={onToggleTheme}
              title={isLight ? '切換為 OLED 純黑省電主題' : '切換為明亮主題'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-neutral-950 border-neutral-800 text-amber-400 hover:border-neutral-700'
              }`}
              aria-label="切換主題"
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* 通知權限按鈕 */}
            <button
              onClick={onRequestNotificationPermission}
              title={notificationsEnabled ? '推播通知已啟用' : '點擊啟用通知'}
              className={`p-1.5 rounded-lg border transition-colors ${
                notificationsEnabled
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-neutral-950 border-neutral-800 text-emerald-400 hover:border-emerald-500/50'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-400'
                  : 'bg-neutral-950 border-amber-900/60 text-amber-400'
              }`}
              aria-label="切換推播通知"
            >
              {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* OLED HUD 常亮模式按鈕 */}
            <button
              onClick={onOpenOledHud}
              title="開啟微光省電常亮 HUD"
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-neutral-950 border-neutral-800 text-indigo-300 hover:text-white'
              }`}
            >
              <Moon size={13} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
              <span>HUD</span>
            </button>

            {/* 指南手冊按鈕 */}
            <button
              onClick={onOpenGuide}
              title="查看說明與機制指南"
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label="查看指南"
            >
              <BookOpen size={16} />
            </button>

            {/* 新增點位按鈕 */}
            <button
              onClick={onOpenNewModal}
              title="新增蘑菇地點"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>新增</span>
            </button>
          </div>
        </div>

        {/* 第二列：今日額度控制條（優化排版，絕不折行） */}
        <div
          className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            isLight ? 'bg-slate-100/80 border-slate-200' : 'bg-neutral-950/90 border-neutral-900'
          }`}
        >
          {/* 額度燈號與剩餘文字 */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={`text-[11px] whitespace-nowrap font-medium ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              今日額度
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((slot) => {
                const isActive = slot <= quota.remaining;
                return (
                  <span
                    key={slot}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isActive
                        ? isLight
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : isLight
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                    }`}
                  >
                    {slot}
                  </span>
                );
              })}
            </div>
            <span className={`text-[11px] whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              剩餘 <strong className={isLight ? 'text-slate-800' : 'text-neutral-200'}>{quota.remaining}</strong>/3 次
            </span>
          </div>

          {/* 快速加減操作按鈕 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onUpdateQuota(-1)}
              disabled={quota.remaining <= 0}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors whitespace-nowrap disabled:opacity-30 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              -1 次
            </button>
            <button
              onClick={() => onUpdateQuota(1)}
              disabled={quota.remaining >= 3}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors whitespace-nowrap disabled:opacity-30 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              +1 恢復
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
