import React, { useState, useEffect } from 'react';
import { MushroomSpot, MushroomCategory, MushroomTypeId } from '../types/mushroom';
import { X, Sparkles, Dices, AlertTriangle, Calendar } from 'lucide-react';
import { getRandomMushroomName } from '../utils/randomNames';
import { COLOR_MUSHROOMS, ELEMENT_MUSHROOMS, EVENT_MUSHROOMS, isWeekend, getMushroomMeta } from '../utils/mushroomData';

interface MushroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spotData: Partial<MushroomSpot>) => void;
  editingSpot?: MushroomSpot | null;
  theme?: 'oled' | 'light';
}

export const MushroomModal: React.FC<MushroomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSpot,
  theme = 'oled',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MushroomCategory>('color');
  const [typeId, setTypeId] = useState<MushroomTypeId>('red');
  const [size, setSize] = useState<'normal' | 'large' | 'giant'>('normal');
  const [notes, setNotes] = useState('');

  const isLight = theme === 'light';
  const weekendActive = isWeekend();

  useEffect(() => {
    if (editingSpot) {
      setName(editingSpot.name);
      setCategory(editingSpot.category || 'color');
      setTypeId(editingSpot.typeId || 'red');
      setSize(editingSpot.size || 'normal');
      setNotes(editingSpot.notes || '');
    } else {
      setName('');
      setCategory('color');
      setTypeId('red');
      setSize('normal');
      setNotes('');
    }
  }, [editingSpot, isOpen]);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const randomName = getRandomMushroomName();
    setName(randomName);
  };

  const selectedMeta = getMushroomMeta(typeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      typeId,
      size,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
          isLight
            ? 'bg-white border-[#D6E5D0] text-[#182B1B]'
            : 'bg-zinc-950 border-tactical-border text-zinc-100'
        }`}
      >
        {/* 標頭 */}
        <div
          className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between transition-colors ${
            isLight ? 'border-[#D6E5D0] bg-[#F4F8F1]' : 'border-tactical-border bg-black'
          }`}
        >
          <h2 className="font-display text-base font-extrabold flex items-center gap-2">
            <Sparkles size={16} className={isLight ? 'text-[#2E9B0F]' : 'text-tactical-green'} />
            <span>{editingSpot ? '編輯蘑菇點位' : '新增蘑菇點位'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isLight
                ? 'text-[#556B58] hover:text-[#182B1B] hover:bg-[#E8F2E4]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* 點位名稱與隨機生成 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`font-bold ${isLight ? 'text-[#182B1B]' : 'text-zinc-300'}`}>
                蘑菇地點名稱 <span className={isLight ? 'text-[#2E9B0F]' : 'text-tactical-green'}>*</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 border ${
                  isLight
                    ? 'bg-[#EEF5EA] text-[#24800B] border-[#DCE8D8] hover:bg-[#E3F2DF] shadow-sm'
                    : 'bg-tactical-moss text-tactical-green border-tactical-border hover:bg-zinc-900'
                }`}
                title="隨機帶入常見地標或公園名稱"
              >
                <Dices size={13} />
                <span>隨機生成名稱</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：大安公園音樂台、二二八和平公園水池"
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none transition-colors ${
                isLight
                  ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#182B1B] placeholder-[#8FA590] focus:border-[#2E9B0F] focus:bg-white'
                  : 'bg-black border-tactical-border text-white placeholder-zinc-600 focus:border-tactical-green'
              }`}
            />
          </div>

          {/* 蘑菇三大主分類切換頁籤 */}
          <div>
            <label className={`block font-bold mb-1.5 ${isLight ? 'text-[#182B1B]' : 'text-zinc-300'}`}>
              選擇蘑菇體系分類
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('color');
                  setTypeId('red');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all active:scale-95 ${
                  category === 'color'
                    ? isLight
                      ? 'bg-[#2E9B0F] text-white border-[#2E9B0F] shadow-sm'
                      : 'bg-tactical-green text-black border-tactical-green shadow-sm'
                    : isLight
                    ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B]'
                    : 'bg-black border-tactical-border text-zinc-400 hover:text-white'
                }`}
              >
                1. 顏色菇
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('element');
                  setTypeId('fire');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all active:scale-95 ${
                  category === 'element'
                    ? isLight
                      ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                      : 'bg-tactical-cyan text-black border-tactical-cyan shadow-sm'
                    : isLight
                    ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B]'
                    : 'bg-black border-tactical-border text-zinc-400 hover:text-white'
                }`}
              >
                2. 元素菇
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('event');
                  setTypeId(weekendActive ? 'event_giant' : 'event_normal');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-bold transition-all active:scale-95 ${
                  category === 'event'
                    ? isLight
                      ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                      : 'bg-tactical-amber text-black border-tactical-amber shadow-sm'
                    : isLight
                    ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B]'
                    : 'bg-black border-tactical-border text-zinc-400 hover:text-white'
                }`}
              >
                3. 活動菇
              </button>
            </div>
          </div>

          {/* 子選項展示區 */}
          <div
            className={`p-3 rounded-xl border transition-colors ${
              isLight ? 'bg-[#F4F8F1] border-[#D6E5D0]' : 'bg-black border-tactical-border/70'
            }`}
          >
            {category === 'color' && (
              <div>
                <div className={`text-[11px] mb-2 font-bold ${isLight ? 'text-[#556B58]' : 'text-zinc-400'}`}>
                  八種基礎顏色菇（派同色皮克敏享有攻擊力加成）：
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(COLOR_MUSHROOMS).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTypeId(item.id)}
                      className={`py-2 px-1 rounded-xl border text-center font-bold transition-all active:scale-95 ${
                        typeId === item.id
                          ? `${item.badgeBg} ${item.badgeBorder} ${item.badgeText} ring-2 ${isLight ? 'ring-[#2E9B0F]' : 'ring-tactical-green'} shadow-sm`
                          : isLight
                          ? 'bg-white border-[#D6E5D0] text-[#182B1B] hover:bg-[#E8F2E4]'
                          : 'bg-zinc-950 border-tactical-border text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.name.replace('蘑菇', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'element' && (
              <div className="space-y-2">
                <div className={`text-[11px] font-bold ${isLight ? 'text-[#556B58]' : 'text-zinc-400'}`}>
                  五種屬性元素菇（具備嚴格限定派遣限制）：
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(ELEMENT_MUSHROOMS).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTypeId(item.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                        typeId === item.id
                          ? `${item.badgeBg} ${item.badgeBorder} ring-2 ${isLight ? 'ring-[#0284C7]' : 'ring-tactical-cyan'} shadow-sm font-bold`
                          : isLight
                          ? 'bg-white border-[#D6E5D0] text-[#182B1B] hover:bg-[#E8F2E4]'
                          : 'bg-zinc-950 border-tactical-border text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${item.badgeText}`}>{item.name}</div>
                        <div className={`text-[10px] ${isLight ? 'text-[#556B58]' : 'text-zinc-500'}`}>
                          {item.description}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold whitespace-nowrap">
                        {item.dispatchRule}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'event' && (
              <div className="space-y-2">
                <div className={`text-[11px] font-bold ${isLight ? 'text-[#556B58]' : 'text-zinc-400'}`}>
                  活動主題蘑菇（配合時間週期出現）：
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(EVENT_MUSHROOMS).map((item) => {
                    const isGiant = item.id === 'event_giant';
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setTypeId(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${
                          typeId === item.id
                            ? `${item.badgeBg} ${item.badgeBorder} ring-2 ${isLight ? 'ring-[#D97706]' : 'ring-tactical-amber'} shadow-sm font-bold`
                            : isLight
                            ? 'bg-white border-[#D6E5D0] text-[#182B1B] hover:bg-[#E8F2E4]'
                            : 'bg-zinc-950 border-tactical-border text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${item.badgeText}`}>{item.name}</span>
                          {isGiant && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                                weekendActive
                                  ? 'bg-[#DCF5D6] text-[#18450c] border-[#BCE7B4]'
                                  : 'bg-zinc-200 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                              }`}
                            >
                              <Calendar size={11} />
                              {weekendActive ? '週末進行中' : '週末限定 (每週六、日登場)'}
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] ${isLight ? 'text-[#556B58]' : 'text-zinc-500'}`}>
                          {item.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 派遣規則醒目提醒 */}
          {selectedMeta.dispatchRule && (
            <div className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400 flex items-center gap-2 text-xs font-bold">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>派遣限制注意：{selectedMeta.name}{selectedMeta.dispatchRule}！</span>
            </div>
          )}

          {/* 蘑菇尺寸規格 */}
          <div>
            <label className={`block font-bold mb-1.5 ${isLight ? 'text-[#182B1B]' : 'text-zinc-300'}`}>
              蘑菇尺寸規格
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'normal', label: '普通' },
                  { id: 'large', label: '大型' },
                  { id: 'giant', label: '巨大' },
                ] as const
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSize(item.id)}
                  className={`py-2 rounded-xl border font-bold transition-all active:scale-95 ${
                    size === item.id
                      ? isLight
                        ? 'bg-[#2E9B0F] text-white border-[#2E9B0F] shadow-sm'
                        : 'bg-tactical-green text-black border-tactical-green shadow-sm'
                      : isLight
                      ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#556B58] hover:text-[#182B1B]'
                      : 'bg-black border-tactical-border text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 備註筆記 */}
          <div>
            <label className={`block font-bold mb-1.5 ${isLight ? 'text-[#182B1B]' : 'text-zinc-300'}`}>
              備註筆記（選填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：容易掉落特級精華、預計號召 5 位好友合擊"
              rows={2}
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none transition-colors resize-none ${
                isLight
                  ? 'bg-[#F4F8F1] border-[#D6E5D0] text-[#182B1B] placeholder-[#8FA590] focus:border-[#2E9B0F] focus:bg-white'
                  : 'bg-black border-tactical-border text-white placeholder-zinc-600 focus:border-tactical-green'
              }`}
            />
          </div>

          {/* 提交按鈕 */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-[#F4F8F1] hover:bg-[#E8F2E4] border-[#D6E5D0] text-[#556B58]'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-tactical-border'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${
                isLight
                  ? 'bg-[#2E9B0F] hover:bg-[#25820C] text-white shadow-[#2E9B0F]/25'
                  : 'bg-tactical-green hover:bg-tactical-green/90 text-black'
              }`}
            >
              {editingSpot ? '儲存變更' : '建立點位'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
