import React, { useState, useEffect } from 'react';
import { MushroomSpot, MushroomColor } from '../types/mushroom';
import { X, Sparkles, Dices } from 'lucide-react';
import { getRandomMushroomName } from '../utils/randomNames';

interface MushroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spotData: Partial<MushroomSpot>) => void;
  editingSpot?: MushroomSpot | null;
  theme?: 'oled' | 'light';
}

const COLOR_OPTIONS: { id: MushroomColor; label: string; bg: string; border: string; text: string }[] = [
  { id: 'red', label: '紅色', bg: 'bg-red-950/50', border: 'border-red-500', text: 'text-red-400' },
  { id: 'blue', label: '藍色', bg: 'bg-blue-950/50', border: 'border-blue-500', text: 'text-blue-400' },
  { id: 'yellow', label: '黃色', bg: 'bg-yellow-950/50', border: 'border-yellow-500', text: 'text-yellow-400' },
  { id: 'purple', label: '紫色', bg: 'bg-purple-950/50', border: 'border-purple-500', text: 'text-purple-400' },
  { id: 'white', label: '白色', bg: 'bg-slate-800/50', border: 'border-slate-400', text: 'text-slate-200' },
  { id: 'rock', label: '岩石', bg: 'bg-zinc-800/50', border: 'border-zinc-400', text: 'text-zinc-300' },
  { id: 'winged', label: '羽翼', bg: 'bg-pink-950/50', border: 'border-pink-500', text: 'text-pink-400' },
  { id: 'fire', label: '烈火', bg: 'bg-orange-950/50', border: 'border-orange-500', text: 'text-orange-400' },
  { id: 'water', label: '水流', bg: 'bg-cyan-950/50', border: 'border-cyan-500', text: 'text-cyan-400' },
  { id: 'electric', label: '電力', bg: 'bg-amber-950/50', border: 'border-amber-500', text: 'text-amber-400' },
  { id: 'poison', label: '劇毒', bg: 'bg-lime-950/50', border: 'border-lime-500', text: 'text-lime-400' },
  { id: 'mystery', label: '神秘', bg: 'bg-teal-950/50', border: 'border-teal-500', text: 'text-teal-400' },
  { id: 'giant', label: '巨大', bg: 'bg-rose-950/50', border: 'border-rose-500', text: 'text-rose-400' },
  { id: 'special', label: '特殊', bg: 'bg-fuchsia-950/50', border: 'border-fuchsia-500', text: 'text-fuchsia-400' },
];

export const MushroomModal: React.FC<MushroomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSpot,
  theme = 'oled',
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<MushroomColor>('red');
  const [size, setSize] = useState<'normal' | 'large' | 'giant'>('normal');
  const [notes, setNotes] = useState('');

  const isLight = theme === 'light';

  useEffect(() => {
    if (editingSpot) {
      setName(editingSpot.name);
      setColor(editingSpot.color);
      setSize(editingSpot.size || 'normal');
      setNotes(editingSpot.notes || '');
    } else {
      setName('');
      setColor('red');
      setSize('normal');
      setNotes('');
    }
  }, [editingSpot, isOpen]);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const randomName = getRandomMushroomName();
    setName(randomName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      color,
      size,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-oled-card border-neutral-800 text-neutral-100'
        }`}
      >
        {/* 標頭 */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-black'
          }`}
        >
          <h2 className="text-base font-bold flex items-center gap-2">
            <Sparkles size={16} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
            <span>{editingSpot ? '編輯蘑菇點位' : '新增蘑菇點位'}</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 點位名稱與隨機生成按鈕 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`font-semibold ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                蘑菇地點名稱 <span className="text-emerald-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-neutral-900 text-emerald-400 border-neutral-800 hover:bg-neutral-800'
                }`}
                title="隨機帶入常見地標或公園名稱"
              >
                <Dices size={13} />
                <span>隨機生成名稱</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：大安公園音樂台、二二八和平公園水池"
                className={`w-full rounded-xl px-3 py-2 border focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'
                    : 'bg-black border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* 顏色與屬性選擇 */}
          <div>
            <label className={`block font-semibold mb-2 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              蘑菇屬性 / 顏色
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setColor(item.id)}
                  className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                    color === item.id
                      ? `${item.bg} ${item.border} ${item.text} ring-2 ring-emerald-500 shadow-md font-bold`
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 蘑菇尺寸 */}
          <div>
            <label className={`block font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
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
                      ? isLight
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                        : 'bg-neutral-800 border-emerald-500 text-emerald-400 font-bold'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 備註筆記 */}
          <div>
            <label className={`block font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
              備註筆記（選填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：容易掉落紅色特殊精華、建議出動 40 隻紫色主力"
              rows={2}
              className={`w-full rounded-xl px-3 py-2 border focus:outline-none transition-colors resize-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'
                  : 'bg-black border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* 提交按鈕 */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold transition-colors shadow-sm"
            >
              {editingSpot ? '儲存變更' : '建立點位'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
