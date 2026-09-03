import React from 'react';
import { Plus, Moon, BookOpen, Bell, BellOff } from 'lucide-react';
import { DailyQuota } from '../types/mushroom';

interface HeaderProps {
  quota: DailyQuota;
  onUpdateQuota: (delta: number) => void;
  onOpenNewModal: () => void;
  onOpenOledHud: () => void;
  onOpenGuide: () => void;
  notificationsEnabled: boolean;
  onRequestNotificationPermission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quota,
  onUpdateQuota,
  onOpenNewModal,
  onOpenOledHud,
  onOpenGuide,
  notificationsEnabled,
  onRequestNotificationPermission,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-oled-border px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Logo & 標題 */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl shadow-inner">
            🍄
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-100 tracking-tight flex items-center gap-1.5">
              皮克敏蘑菇追蹤
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-emerald-400 border border-neutral-800">
                OLED
              </span>
            </h1>
            <p className="text-[11px] text-neutral-500">出現與重生倒數定時器</p>
          </div>
        </div>

        {/* 頂部快捷按鈕群 */}
        <div className="flex items-center space-x-2">
          {/* 通知權限按鈕 */}
          <button
            onClick={onRequestNotificationPermission}
            title={notificationsEnabled ? '推播通知已啟用' : '點擊啟用通知'}
            className={`p-2 rounded-lg border transition-colors ${
              notificationsEnabled
                ? 'bg-neutral-950 border-neutral-800 text-emerald-400 hover:border-emerald-500/50'
                : 'bg-neutral-950 border-amber-900/60 text-amber-400 hover:border-amber-500/80'
            }`}
            aria-label="切換推播通知"
          >
            {notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />}
          </button>

          {/* OLED HUD 常亮模式按鈕 */}
          <button
            onClick={onOpenOledHud}
            title="開啟 OLED 微光省電常亮"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-xs font-medium"
          >
            <Moon size={14} className="text-indigo-400" />
            <span>HUD</span>
          </button>

          {/* 機制說明書 */}
          <button
            onClick={onOpenGuide}
            title="查看蘑菇機制與使用說明"
            className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="查看指南"
          >
            <BookOpen size={17} />
          </button>

          {/* 新增點位 */}
          <button
            onClick={onOpenNewModal}
            title="新增蘑菇地點"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>新增</span>
          </button>
        </div>
      </div>

      {/* 每日額度控制條 */}
      <div className="max-w-xl mx-auto mt-2.5 pt-2 border-t border-neutral-900/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <span>今日免費次數：</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((slot) => (
              <span
                key={slot}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  slot <= quota.remaining
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                }`}
              >
                {slot}
              </span>
            ))}
          </div>
          <span className="text-[11px] text-neutral-500">
            （剩餘 <strong className="text-neutral-300">{quota.remaining}</strong> / 3 次）
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQuota(-1)}
            disabled={quota.remaining <= 0}
            className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 disabled:opacity-30 text-[11px] hover:bg-neutral-900"
          >
            消耗 1 次
          </button>
          <button
            onClick={() => onUpdateQuota(1)}
            disabled={quota.remaining >= 3}
            className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 disabled:opacity-30 text-[11px] hover:bg-neutral-900"
          >
            恢復
          </button>
        </div>
      </div>
    </header>
  );
};
