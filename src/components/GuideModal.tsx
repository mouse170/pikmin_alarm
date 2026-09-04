import React, { useState } from 'react';
import { X, BookOpen, Clock, Zap, PlayCircle, Smartphone, AlertTriangle, Calendar, Award, Monitor, Apple } from 'lucide-react';
import { getDeviceType, triggerIOSShortcutTimer } from '../utils/device';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => void;
  theme?: 'oled' | 'light';
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
  theme = 'oled',
}) => {
  const [platformTab, setPlatformTab] = useState<'ios' | 'android' | 'desktop'>(getDeviceType());

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-oled-card border-neutral-800 text-neutral-300'
        }`}
      >
        {/* 標頭 */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
            <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-neutral-100'}`}>
              皮克敏蘑菇追蹤器使用指南與平台設定
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* 說明書內容 */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* 示範資料載入卡片 */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-r from-emerald-950/40 to-neutral-900 border-emerald-500/30'
            }`}
          >
            <div>
              <div
                className={`font-bold text-sm flex items-center gap-1.5 ${
                  isLight ? 'text-emerald-900' : 'text-neutral-100'
                }`}
              >
                <PlayCircle size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                <span>初次使用？一鍵載入示範點位</span>
              </div>
              <p className={`text-[11px] mt-1 ${isLight ? 'text-emerald-700' : 'text-neutral-400'}`}>
                立即載入包含顏色菇、元素菇與活動菇的完整示範資料，體驗 5 分鐘倒數與提前提醒。
              </p>
            </div>
            <button
              onClick={() => {
                onLoadDemoData();
                onClose();
              }}
              className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              載入示範
            </button>
          </div>

          {/* 第一章：各作業系統專屬指引（iOS / Android / 電腦版 切換） */}
          <section className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3
                className={`text-sm font-bold flex items-center gap-2 border-l-2 border-emerald-500 pl-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <Smartphone size={15} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                <span>平台最佳化與後台提醒教學</span>
              </h3>

              {/* 平台切換按鈕頁籤 */}
              <div className="flex items-center gap-1 p-1 rounded-xl border bg-black/40">
                <button
                  onClick={() => setPlatformTab('ios')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all ${
                    platformTab === 'ios'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Apple size={13} />
                  <span>iOS (iPhone)</span>
                </button>
                <button
                  onClick={() => setPlatformTab('android')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all ${
                    platformTab === 'android'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setPlatformTab('desktop')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all ${
                    platformTab === 'desktop'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isLight
                      ? 'text-slate-600 hover:text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Monitor size={13} />
                  <span>電腦版 (Desktop)</span>
                </button>
              </div>
            </div>

            {/* iOS 專屬說明 */}
            {platformTab === 'ios' && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-amber-50/60 border-amber-200 text-slate-700' : 'bg-amber-950/20 border-amber-500/30 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <Zap size={16} />
                  <span>iOS 設備必讀：使用原生「捷徑計時」突破鎖屏休眠限制</span>
                </div>
                <p className="text-[11px]">
                  iOS 系統在手機電源鍵鎖定螢幕後，會凍結網頁計時器。為確保您在鎖屏時仍能收到聲音提醒，本應用為 iOS 設備專門打造了<strong>「捷徑原生時鐘連動」</strong>功能！
                </p>

                <div className={`p-3 rounded-lg border space-y-2 ${isLight ? 'bg-white border-amber-200' : 'bg-black border-amber-900/60'}`}>
                  <div className="font-bold text-xs text-amber-400">建立「皮克敏計時器」捷徑步驟（只需 1 分鐘）：</div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
                    <li>打開 iPhone 內建<strong>「捷徑」App</strong>，點選右上角「+」。</li>
                    <li>將捷徑名稱改為：<strong>皮克敏計時器</strong>。</li>
                    <li>新增動作：搜尋<strong>「開始計時」</strong>（時鐘）。</li>
                    <li>將時間設定為<strong>「捷徑輸入」</strong>，單位設為<strong>「分鐘」</strong>。</li>
                    <li>按完成儲存。之後在網頁卡片點擊<strong>「捷徑計時」</strong>即可直接自動設定時鐘鬧鐘！</li>
                  </ol>
                  <button
                    onClick={() => triggerIOSShortcutTimer(5)}
                    className="mt-2 w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Zap size={13} />
                    <span>測試執行捷徑（倒數 5 分鐘）</span>
                  </button>
                </div>

                <div className="text-[11px] pt-1">
                  <strong>PWA 安裝</strong>：使用 Safari 瀏覽器打開本網頁 → 點擊底部「分享」圖示 → 選擇「加入主畫面」，即可享有全螢幕獨立 App 體驗。
                </div>
              </div>
            )}

            {/* Android 專屬說明 */}
            {platformTab === 'android' && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-emerald-50/60 border-emerald-200 text-slate-700' : 'bg-emerald-950/20 border-emerald-500/30 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                  <Smartphone size={16} />
                  <span>Android 設備：PWA 安裝與後台推播最佳化</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <p>
                    <strong>1. 安裝為應用程式</strong>：在 Chrome 瀏覽器打開本網頁，點擊右上角三點選單，選擇「安裝應用程式」或「新增至主螢幕」。
                  </p>
                  <p>
                    <strong>2. 啟用通知權限</strong>：首次進入請點擊頂部鈴鐺圖示允許通知。系統將於重生前 1~3 分鐘提早發出推播，並於 0 分鐘準時發出完成提醒。
                  </p>
                  <p>
                    <strong>3. 電池最佳化設定</strong>：若想確保背景通知不被系統延遲，建議至手機「設定」→「應用程式」→「蘑菇紀錄器」→ 將電池改為「不受限制」。
                  </p>
                </div>
              </div>
            )}

            {/* 電腦版 (Desktop) 專屬說明 */}
            {platformTab === 'desktop' && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? 'bg-indigo-50/60 border-indigo-200 text-slate-700' : 'bg-indigo-950/20 border-indigo-500/30 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Monitor size={16} />
                  <span>電腦版直覺 UI：多欄位並排監控</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <p>
                    <strong>1. 多欄位網格介面（Responsive Multi-Column）</strong>：電腦版介面自動依螢幕寬度切換為雙欄或三欄並排佈局，讓您可以同時監控數十個據點的重生時間，無須頻繁上下滑動。
                  </p>
                  <p>
                    <strong>2. 桌面推播與背景和弦音</strong>：只要將本網頁分頁保持開啟在背景，時間到達時瀏覽器即會發出提示音與桌面通知橫幅。
                  </p>
                  <p>
                    <strong>3. 數據自動儲存</strong>：所有點位與自訂紀錄皆即時同步於瀏覽器本機快顯中，關閉分頁後重新開啟資料依然完整。
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 第二章：蘑菇三大體系完整說明 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-indigo-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Award size={15} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
              <span>二、 皮克敏三大蘑菇體系與派遣規則</span>
            </h3>

            <div className="space-y-2 pl-3">
              {/* 顏色菇 */}
              <div className={`p-3 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-900'}`}>
                <div className="font-semibold text-neutral-200">1. 顏色菇（基礎色菇）</div>
                <p className="text-neutral-400">
                  包含紅色、黃色、藍色、紫色、白色、粉紅、灰色（岩石）、冰藍色。所有皮克敏皆可出戰，派同色享有攻擊力加成。
                </p>
              </div>

              {/* 元素菇 */}
              <div className={`p-3 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-900'}`}>
                <div className="font-semibold text-amber-500 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>2. 元素菇（屬性菇）—— 嚴格限定派遣</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-400 pl-1">
                  <li><strong>火蘑菇</strong>：僅限派出紅皮克敏。</li>
                  <li><strong>水蘑菇</strong>：僅限派出藍皮克敏。</li>
                  <li><strong>電蘑菇</strong>：僅限派出黃皮克敏。</li>
                  <li><strong>毒蘑菇</strong>：僅限派出白皮克敏。</li>
                  <li><strong>水晶蘑菇</strong>：僅限派出岩石皮克敏。</li>
                </ul>
              </div>

              {/* 活動菇 */}
              <div className={`p-3 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-900'}`}>
                <div className="font-semibold text-fuchsia-400 flex items-center gap-1">
                  <Calendar size={13} />
                  <span>3. 活動菇與巨型活動菇（週期限定）</span>
                </div>
                <p className="text-neutral-400">
                  當月活動菇提供活動專屬精華與特別道具；<strong>巨型活動菇為每週六、日週末限定登場</strong>，血量龐大、參與人數多且獎勵最豐富。
                </p>
              </div>
            </div>
          </section>

          {/* 第三章：5 分鐘週期與提前提醒 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-amber-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Clock size={15} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
              <span>三、 5 分鐘重生週期與提前 1~3 分鐘提醒</span>
            </h3>
            <div className="space-y-2 pl-3">
              <div className={`p-3 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black border-neutral-900'}`}>
                <p className="text-neutral-400">
                  蘑菇被打掉後通常於 <strong>5 分鐘</strong>內重生。系統在進入剩餘 <strong>1~3 分鐘（預設 2 分鐘）</strong>時，會觸發琥珀色微光閃爍、預警和弦音與通知，讓您有充裕時間開啟遊戲畫面搶占名額！
                </p>
                <p className="text-neutral-400 pt-1">
                  每日 3 次免費挑戰額度於<strong>每日午夜 00:00</strong> 自動跨日重置。
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* 底部關閉按鈕 */}
        <div
          className={`p-4 border-t flex justify-end ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-bold transition-colors text-xs ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
            }`}
          >
            了解並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
