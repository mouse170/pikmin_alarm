import React from 'react';
import { X, Play, Zap } from 'lucide-react';
import { triggerIOSShortcutTimer } from '../utils/device';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'oled' | 'light';
}

export const ShortcutModal: React.FC<ShortcutModalProps> = ({
  isOpen,
  onClose,
  theme = 'oled',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  // 測試執行 5 分鐘計時
  const handleTestShortcut = () => {
    triggerIOSShortcutTimer(5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-tactical-border text-zinc-200'
        }`}
      >
        {/* 標頭 */}
        <div
          className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-tactical-border bg-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-tactical-amber" />
            <h2 className="font-display text-base font-bold text-white">
              iOS 捷徑原生計時設定
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 內容說明 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl border bg-zinc-900/80 border-tactical-amber/30 text-zinc-300">
            <div className="font-display font-bold text-sm mb-1 text-tactical-amber flex items-center gap-1.5">
              <span>解決 iOS 鎖屏休眠漏失通知</span>
            </div>
            <p className="text-[11px] leading-normal text-zinc-400">
              iOS 系統在螢幕鎖定時會凍結網頁計時。透過 iOS「捷徑」連動原生「時鐘」，點擊按鈕即可自動開啟系統計時器，鎖屏時鬧鐘照樣準時響鈴。
            </p>
          </div>

          {/* 建立步驟 */}
          <div className="space-y-2">
            <div className="font-display font-bold text-sm text-white">
              如何建立「皮克敏計時器」捷徑（只需 1 分鐘）
            </div>

            <ol className="list-decimal list-inside space-y-2 p-3 rounded-xl border bg-black border-tactical-border text-zinc-300">
              <li>
                打開 iPhone 內建的<strong>「捷徑」App</strong>，點擊右上角「+」新增捷徑。
              </li>
              <li>
                將捷徑命名為：<strong className="text-white">皮克敏計時器</strong>。
              </li>
              <li>
                加入動作：搜尋並加入<strong>「開始計時」</strong>（時鐘）。
              </li>
              <li>
                將計時時間長度設定為<strong>「捷徑輸入」</strong>，單位選擇<strong>「分鐘」</strong>。
              </li>
              <li>
                點擊「完成」儲存即可。日後網頁點擊「捷徑計時」，iOS 將自動代入分鐘數開始倒數。
              </li>
            </ol>
          </div>

          {/* 測試按鈕 */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestShortcut}
              className="w-full py-2.5 px-4 rounded-xl bg-tactical-amber hover:bg-tactical-amber/90 text-black font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
            >
              <Play size={14} fill="currentColor" />
              <span>測試喚起捷徑（啟動 5 分鐘計時）</span>
            </button>
            <p className="text-[10px] text-center mt-1.5 text-zinc-500">
              若已建立名為「皮克敏計時器」之捷徑，點擊將直接開啟時鐘倒數
            </p>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="p-3.5 sm:p-4 border-t border-tactical-border bg-black flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold transition-colors text-xs bg-zinc-900 hover:bg-zinc-800 text-white border border-tactical-border"
          >
            完成並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
