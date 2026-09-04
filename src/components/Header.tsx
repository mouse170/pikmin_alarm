import React from 'react';
import { Plus, Moon, Sun, BookOpen, Bell, BellOff, Sparkles } from 'lucide-react';
import { DailyQuota } from '../types/mushroom';
import { isWeekend } from '../utils/mushroomData';

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
  const weekendActive = isWeekend();

  return (
    <header className="sticky top-0 z-30 border-b border-md-outline-variant/50 bg-md-surface-container/90 backdrop-blur-md transition-colors px-3 py-2.5">
      <div className="max-w-6xl mx-auto space-y-2">
        {/* 第一列：標題列與功能按鈕群 */}
        <div className="flex items-center justify-between gap-2">
          {/* 左側 Logo 與標題 */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="w-8 h-8 rounded-xl bg-md-primary flex items-center justify-center text-md-on-primary text-base font-black shadow-sm flex-shrink-0">
              🍄
            </div>
            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm font-bold tracking-tight text-md-on-surface whitespace-nowrap truncate">
                皮克敏蘑菇追蹤
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-md-secondary-container text-md-on-secondary-container border border-md-outline-variant/60 flex-shrink-0">
                {isLight ? '明亮' : 'OLED'}
              </span>
              {weekendActive && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-md-error-container text-md-on-error-container border border-md-error/30 flex items-center gap-0.5">
                  <Sparkles size={10} />
                  <span>週末巨型菇</span>
                </span>
              )}
            </div>
          </div>

          {/* 右側按鈕群 */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* 主題切換按鈕 */}
            <button
              onClick={onToggleTheme}
              title={isLight ? '切換為 OLED 純黑深色模式' : '切換為明亮模式'}
              className="p-1.5 rounded-xl border border-md-outline-variant bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-variant transition-colors"
              aria-label="切換主題"
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* 通知權限按鈕 */}
            <button
              onClick={onRequestNotificationPermission}
              title={notificationsEnabled ? '推播通知已啟用（含 1~3 分鐘提前提醒）' : '點擊啟用通知'}
              className={`p-1.5 rounded-xl border transition-colors ${
                notificationsEnabled
                  ? 'bg-md-primary-container text-md-on-primary-container border-md-primary/40'
                  : 'bg-md-surface-container-high text-md-on-surface-variant border-md-outline-variant'
              }`}
              aria-label="切換推播通知"
            >
              {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* OLED HUD 常亮模式按鈕 */}
            <button
              onClick={onOpenOledHud}
              title="開啟微光省電常亮 HUD"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-md-outline-variant bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-variant transition-colors text-xs font-semibold"
            >
              <Moon size={13} className="text-md-tertiary" />
              <span>HUD</span>
            </button>

            {/* 指南手冊按鈕 */}
            <button
              onClick={onOpenGuide}
              title="查看說明指南與平台教學"
              className="p-1.5 rounded-xl border border-md-outline-variant bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-variant transition-colors"
              aria-label="查看指南"
            >
              <BookOpen size={16} />
            </button>

            {/* 新增點位按鈕 */}
            <button
              onClick={onOpenNewModal}
              title="新增蘑菇地點"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-md-primary hover:opacity-90 text-md-on-primary font-bold text-xs transition-opacity shadow-sm whitespace-nowrap"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>新增</span>
            </button>
          </div>
        </div>

        {/* 第二列：今日額度狀態條 */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-2xl border border-md-outline-variant/60 bg-md-surface-container-high text-xs">
          {/* 額度燈號與剩餘文字 */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[11px] whitespace-nowrap font-medium text-md-on-surface-variant">
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
                        ? 'bg-md-primary text-md-on-primary shadow-sm'
                        : 'bg-md-surface-container text-md-on-surface-variant/40 border border-md-outline-variant'
                    }`}
                  >
                    {slot}
                  </span>
                );
              })}
            </div>
            <span className="text-[11px] whitespace-nowrap text-md-on-surface">
              剩餘 <strong>{quota.remaining}</strong>/3 次
            </span>
            <span className="text-[10px] text-md-on-surface-variant/80 hidden sm:inline">
              (跨日 00:00 自動重置)
            </span>
          </div>

          {/* 快速加減操作按鈕 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onUpdateQuota(-1)}
              disabled={quota.remaining <= 0}
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium border border-md-outline-variant bg-md-surface hover:bg-md-surface-container text-md-on-surface transition-colors whitespace-nowrap disabled:opacity-30"
            >
              -1 次
            </button>
            <button
              onClick={() => onUpdateQuota(1)}
              disabled={quota.remaining >= 3}
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium border border-md-outline-variant bg-md-surface hover:bg-md-surface-container text-md-on-surface transition-colors whitespace-nowrap disabled:opacity-30"
            >
              +1 恢復
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
