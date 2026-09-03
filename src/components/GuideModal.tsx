import React from 'react';
import { X, BookOpen, Clock, Zap, Shield, PlayCircle, Smartphone } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-oled-card border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 標頭 */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-neutral-100">蘑菇機制全解析與使用指南</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 說明書內容 */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
          {/* 一鍵體驗示範 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
                <PlayCircle size={16} className="text-emerald-400" />
                <span>初次使用？一鍵載入示範資料</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                立即載入公園、捷運站與公司示範蘑菇點位，親自體驗倒數計時與提醒效果。
              </p>
            </div>
            <button
              onClick={() => {
                onLoadDemoData();
                onClose();
              }}
              className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition-colors shadow-sm"
            >
              載入示範
            </button>
          </div>

          {/* 第一章：皮克敏蘑菇出現頻率與規則 */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
              <Clock size={15} className="text-emerald-400" />
              <span>一、 皮克敏蘑菇出現頻率與核心規則</span>
            </h3>
            <div className="space-y-2 pl-3">
              <div className="p-3 rounded-xl bg-black border border-neutral-900 space-y-1.5">
                <div className="font-semibold text-neutral-200">1. 蘑菇重生週期（約 15 分鐘）</div>
                <p className="text-neutral-400">
                  當某一地點的蘑菇被玩家擊破後，該點位會進入隱藏冷卻期，通常在<strong>擊破後的 15 分鐘內</strong>重生出一朵全新的蘑菇（顏色與尺寸隨機）。利用本工具的「剛打完（15分）」功能，即可在第一時間掌握新蘑菇降臨時刻。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-900 space-y-1.5">
                <div className="font-semibold text-neutral-200">2. 每日免費挑戰額度（每日 3 次）</div>
                <p className="text-neutral-400">
                  每位玩家每日擁有 3 次免費討伐蘑菇額度，並於<strong>每日午夜 00:00（當地時間）</strong>全面重置。若使用蘑菇儲值券挑戰，則不佔用此 3 次免費次數。本工具頂部提供免費次數計數器，支援跨日自動重置。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black border border-neutral-900 space-y-1.5">
                <div className="font-semibold text-neutral-200">3. 蘑菇種類與星級評價</div>
                <p className="text-neutral-400">
                  蘑菇分為常規顏色（紅、黃、藍、紫、白、羽翼、岩石）、特殊屬性（火、水、電、毒）以及活動限定（神秘蘑菇、巨大活動蘑菇）。派入同色或剋屬皮克敏可享有攻擊力加成，加快擊破時間。
                </p>
              </div>
            </div>
          </section>

          {/* 第二章：本工具使用步驟範例 */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-l-2 border-indigo-500 pl-2">
              <Zap size={15} className="text-indigo-400" />
              <span>二、 實戰操作情境範例</span>
            </h3>

            <div className="space-y-2.5 pl-3">
              <div className="p-3.5 rounded-xl bg-black border border-neutral-900">
                <div className="font-semibold text-neutral-200 mb-1">情境 A：剛剛打完身旁的蘑菇</div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                  <li>在卡片上點擊「剛打完 (15分)」。</li>
                  <li>系統立即啟動 15 分鐘倒數計時。</li>
                  <li>
                    點擊「行事曆提醒」可直接將此倒數時間匯入手機內建行事曆（附帶準時通知鬧鐘）。
                  </li>
                  <li>時間到達時，頁面將發出提示和弦音、震動反饋並將卡片狀態變更為綠色「已重生出現」。</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-neutral-900">
                <div className="font-semibold text-neutral-200 mb-1">情境 B：派隊進攻需 2 小時的大蘑菇</div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                  <li>在卡片上點擊「正在打 (自訂)」。</li>
                  <li>選擇 2 小時（120 分鐘）或輸入精確戰鬥時間，點擊啟動。</li>
                  <li>卡片即時顯示戰鬥剩餘時間，並標明預計結束鐘點。</li>
                  <li>若隊友強攻提早打完，點擊「提早打完」即可無縫切換為 15 分鐘重生倒數。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第三章：OLED 純黑省電與手機常亮使用技巧 */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-l-2 border-amber-500 pl-2">
              <Shield size={15} className="text-amber-400" />
              <span>三、 OLED 省電模式與螢幕防護技巧</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-black border border-neutral-900 space-y-2 pl-3">
              <p className="text-neutral-400">
                現代智慧型手機（iPhone Pro 系列、多數 Android 機種）均配備 OLED 面板，純黑色（#000000）時像素點會完全斷電關閉，達到極致省電效果。
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">微光常亮 HUD</strong>：點擊頂部「HUD」按鈕，系統會調用 Screen Wake Lock API 保持螢幕不鎖屏，調降顯示亮度並在桌面上充當時鐘。
                </li>
                <li>
                  <strong className="text-neutral-200">防螢幕烙印（Pixel Shift）</strong>：HUD 模式內建像素偏移防護，每 45 秒會自動在數像素範圍內微調位置，避免 OLED 像素老化。
                </li>
              </ul>
            </div>
          </section>

          {/* 第四章：iOS 與 Android 安裝至主畫面教學 */}
          <section className="space-y-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-l-2 border-rose-500 pl-2">
              <Smartphone size={15} className="text-rose-400" />
              <span>四、 手機「加入主畫面」PWA 安裝指南</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-black border border-neutral-900 space-y-2 pl-3">
              <div className="space-y-1">
                <span className="font-semibold text-neutral-200">iOS (Safari)：</span>
                <p className="text-neutral-400">
                  點擊瀏覽器底部的「分享」按鈕，向下滾動並選擇<strong>「加入主畫面」</strong>。加入後即可全螢幕無邊框啟動，並享有穩定的本機推播通知支援。
                </p>
              </div>
              <div className="space-y-1 pt-1 border-t border-neutral-900">
                <span className="font-semibold text-neutral-200">Android (Chrome)：</span>
                <p className="text-neutral-400">
                  點擊瀏覽器右上角選單（三個點），選擇<strong>「安裝應用程式」</strong>或「新增至主螢幕」，即可享有原生 App 等級體驗。
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 底部關閉按鈕 */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold transition-colors text-xs"
          >
            了解並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
