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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-tactical-border text-zinc-100'
        }`}
      >
        {/* 標頭 */}
        <div
          className={`px-4 sm:px-5 py-3.5 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-tactical-border bg-black'
          }`}
        >
          <h2 className="font-display text-base font-bold flex items-center gap-2 text-white">
            <Sparkles size={16} className="text-tactical-green" />
            <span>{editingSpot ? '編輯蘑菇點位' : '新增蘑菇點位'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* 點位名稱與隨機生成 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-300">
                蘑菇地點名稱 <span className="text-tactical-green">*</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors border bg-tactical-moss text-tactical-green border-tactical-border hover:bg-zinc-900"
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
              className="w-full rounded-xl px-3 py-2 border bg-black border-tactical-border text-white placeholder-zinc-600 focus:outline-none focus:border-tactical-green transition-colors"
            />
          </div>

          {/* 蘑菇三大主分類切換頁籤 */}
          <div>
            <label className="block font-semibold mb-1.5 text-zinc-300">
              選擇蘑菇體系分類
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('color');
                  setTypeId('red');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                  category === 'color'
                    ? 'bg-tactical-green text-black font-bold border-tactical-green shadow-sm'
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
                className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                  category === 'element'
                    ? 'bg-tactical-cyan text-black font-bold border-tactical-cyan shadow-sm'
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
                className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                  category === 'event'
                    ? 'bg-tactical-amber text-black font-bold border-tactical-amber shadow-sm'
                    : 'bg-black border-tactical-border text-zinc-400 hover:text-white'
                }`}
              >
                3. 活動菇
              </button>
            </div>
          </div>

          {/* 子選項展示區 */}
          <div className="p-3 rounded-xl border bg-black border-tactical-border/70">
            {category === 'color' && (
              <div>
                <div className="text-[11px] mb-2 text-zinc-400">
                  八種基礎顏色菇（可派同色皮克敏取得攻擊力加成）：
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(COLOR_MUSHROOMS).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTypeId(item.id)}
                      className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                        typeId === item.id
                          ? `${item.badgeBg} ${item.badgeBorder} ${item.badgeText} ring-2 ring-tactical-green font-bold shadow-md`
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
                <div className="text-[11px] text-zinc-400">
                  五種屬性元素菇（具備嚴格限定派遣限制）：
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(ELEMENT_MUSHROOMS).map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTypeId(item.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        typeId === item.id
                          ? `${item.badgeBg} ${item.badgeBorder} ring-2 ring-tactical-cyan font-bold shadow-md`
                          : 'bg-zinc-950 border-tactical-border text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${item.badgeText}`}>{item.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {item.description}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold whitespace-nowrap">
                        {item.dispatchRule}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'event' && (
              <div className="space-y-2">
                <div className="text-[11px] text-zinc-400">
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
                        className={`p-3 rounded-xl border text-left transition-all ${
                          typeId === item.id
                            ? `${item.badgeBg} ${item.badgeBorder} ring-2 ring-tactical-amber font-bold shadow-md`
                            : 'bg-zinc-950 border-tactical-border text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${item.badgeText}`}>{item.name}</span>
                          {isGiant && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                                weekendActive
                                  ? 'bg-tactical-green/20 text-tactical-green border-tactical-green/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              <Calendar size={11} />
                              {weekendActive ? '週末進行中' : '週末限定 (每週六、日登場)'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">
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
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-amber-400 text-xs">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>派遣限制注意：{selectedMeta.name}{selectedMeta.dispatchRule}！</span>
            </div>
          )}

          {/* 蘑菇尺寸規格 */}
          <div>
            <label className="block font-semibold mb-1.5 text-zinc-300">
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
                  className={`py-2 rounded-xl border font-medium transition-all ${
                    size === item.id
                      ? 'bg-tactical-green text-black font-bold border-tactical-green shadow-sm'
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
            <label className="block font-semibold mb-1.5 text-zinc-300">
              備註筆記（選填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：容易掉落特級精華、預計號召 5 位好友合擊"
              rows={2}
              className="w-full rounded-xl px-3 py-2 border bg-black border-tactical-border text-white placeholder-zinc-600 focus:outline-none focus:border-tactical-green transition-colors resize-none"
            />
          </div>

          {/* 提交按鈕 */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium transition-colors bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-tactical-border"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-tactical-green hover:bg-tactical-green/90 text-black font-bold transition-transform active:scale-95 shadow-sm"
            >
              {editingSpot ? '儲存變更' : '建立點位'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
