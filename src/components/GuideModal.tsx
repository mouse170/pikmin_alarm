import React from 'react';
import { X, BookOpen, Clock, Zap, PlayCircle, Smartphone, AlertTriangle, Calendar, Award } from 'lucide-react';

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
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
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
              皮克敏蘑菇機制全解析與使用指南
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
          {/* 一鍵體驗示範 */}
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

          {/* 第一章：蘑菇三大體系完整說明 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-emerald-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Award size={15} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
              <span>一、 皮克敏三大蘑菇體系與派遣規則</span>
            </h3>

            <div className="space-y-2.5 pl-3">
              {/* 1. 顏色菇 */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                  1. 顏色菇（基礎色菇）
                </div>
                <p>
                  <strong>種類包含</strong>：紅色、黃色、藍色、紫色、白色、粉紅（羽翼）、灰色（岩石）、冰藍色。
                </p>
                <p>
                  <strong>規則</strong>：任何顏色的皮克敏皆可出戰，但派出與蘑菇<strong>相同顏色</strong>或裝飾皮克敏將享有強大的攻擊力加成，加快擊破速度。
                </p>
              </div>

              {/* 2. 元素菇 */}
              <div
                className={`p-3 rounded-xl border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold text-amber-500 flex items-center gap-1`}>
                  <AlertTriangle size={13} />
                  <span>2. 元素菇（屬性菇）—— 具備限定派遣限制</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>火蘑菇</strong>：僅限派出<strong>紅皮克敏</strong>出戰。</li>
                  <li><strong>水蘑菇</strong>：僅限派出<strong>藍皮克敏</strong>出戰。</li>
                  <li><strong>電蘑菇</strong>：僅限派出<strong>黃皮克敏</strong>出戰。</li>
                  <li><strong>毒蘑菇</strong>：僅限派出<strong>白皮克敏</strong>出戰。</li>
                  <li><strong>水晶蘑菇</strong>：僅限派出<strong>岩石皮克敏</strong>出戰。</li>
                </ul>
                <p className="text-[11px] text-neutral-500 pt-0.5">
                  其餘顏色之皮克敏無法進入元素蘑菇，請務必提早培養各單屬性隊伍戰力！
                </p>
              </div>

              {/* 3. 活動菇與巨型活動菇 */}
              <div
                className={`p-3 rounded-xl border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold text-fuchsia-400 flex items-center gap-1`}>
                  <Calendar size={13} />
                  <span>3. 活動菇與巨型活動菇（週期時間限定）</span>
                </div>
                <p>
                  <strong>當月活動菇</strong>：配合當月主題活動全天候出現，挑戰成功可取得當月專屬特別精華與活動道具。
                </p>
                <p>
                  <strong>巨型活動菇</strong>：<strong>週末限定登場（每週六、日）</strong>，血量龐大、可容納參與人數上限高，通關後掉落的果實、精華與獎勵道具量為全遊戲最豐富。本應用在週末會自動標示高亮提醒！
                </p>
              </div>
            </div>
          </section>

          {/* 第二章：5 分鐘重生與 1~3 分鐘提前提醒機制 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-indigo-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Clock size={15} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
              <span>二、 5 分鐘重生週期與 1~3 分鐘提前提醒</span>
            </h3>

            <div className="space-y-2.5 pl-3">
              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                  1. 蘑菇被打掉後 5 分鐘迅速重生
                </div>
                <p>
                  當某一據點的蘑菇被擊破後，該位置進入冷卻期，通常在<strong>擊破後的 5 分鐘內</strong>重生出新蘑菇。點擊卡片上的「剛打完 (5分)」即可啟動 5 分鐘精確倒數。
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                  2. 接近 1~3 分鐘執行提前預警
                </div>
                <p>
                  為了防止玩家因開啟遊戲讀取延誤而錯過搶位，本應用在倒數<strong>進入剩餘 1~3 分鐘（預設 2 分鐘）</strong>時，會自動觸發柔和預警提示、卡片琥珀色閃爍與通知，提醒您提早打開皮克敏 Bloom 畫面就位等待。
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                  3. 每日免費 3 次額度跨日 00:00 自動重置
                </div>
                <p>
                  玩家每天享有 3 次免費挑戰額度。本應用會在手機系統時間跨過午夜 00:00 時，自動將剩餘次數恢復為 3 次，無須手動重開。
                </p>
              </div>
            </div>
          </section>

          {/* 第三章：操作情境示範 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-amber-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Zap size={15} className={isLight ? 'text-amber-600' : 'text-amber-400'} />
              <span>三、 實戰操作情境流程</span>
            </h3>

            <div className="space-y-2 pl-3">
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
                }`}
              >
                <div className={`font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-neutral-200'}`}>
                  情境：打完公園剛重生的火蘑菇
                </div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>新增點位選擇「元素菇」-「火蘑菇」，可點擊「隨機生成名稱」快速輸入地標。</li>
                  <li>擊破後點擊「剛打完 (5分)」。</li>
                  <li>剩餘 2 分鐘時，收到提前預警通知，提醒您準備藍皮克敏或專屬陣容。</li>
                  <li>倒數歸零時，鈴聲響起、卡片變綠「已重生出現」，立即派兵奪得先機。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 第四章：PWA 加入主畫面教學 */}
          <section className="space-y-2.5">
            <h3
              className={`text-sm font-bold flex items-center gap-2 border-l-2 border-rose-500 pl-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Smartphone size={15} className={isLight ? 'text-rose-600' : 'text-rose-400'} />
              <span>四、 手機「加入主畫面」PWA 安裝</span>
            </h3>
            <div
              className={`p-3 rounded-xl border space-y-1.5 pl-3 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black border-neutral-900 text-neutral-400'
              }`}
            >
              <p>
                <strong>iOS Safari</strong>：點擊分享按鈕 → 選擇「加入主畫面」。
              </p>
              <p>
                <strong>Android Chrome</strong>：點擊右上角三點選單 → 選擇「安裝應用程式」或「新增至主畫面」。
              </p>
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
