import React, { useState, useEffect } from 'react';
import { MushroomSpot, MushroomColor } from '../types/mushroom';
import { X, Sparkles } from 'lucide-react';

interface MushroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (spotData: Partial<MushroomSpot>) => void;
  editingSpot?: MushroomSpot | null;
}

const COLOR_OPTIONS: { id: MushroomColor; label: string; bg: string; border: string; text: string }[] = [
  { id: 'red', label: '紅色', bg: 'bg-red-950', border: 'border-red-500', text: 'text-red-400' },
  { id: 'blue', label: '藍色', bg: 'bg-blue-950', border: 'border-blue-500', text: 'text-blue-400' },
  { id: 'yellow', label: '黃色', bg: 'bg-yellow-950', border: 'border-yellow-500', text: 'text-yellow-400' },
  { id: 'purple', label: '紫色', bg: 'bg-purple-950', border: 'border-purple-500', text: 'text-purple-400' },
  { id: 'white', label: '白色', bg: 'bg-slate-900', border: 'border-slate-400', text: 'text-slate-200' },
  { id: 'rock', label: '岩石', bg: 'bg-zinc-900', border: 'border-zinc-400', text: 'text-zinc-300' },
  { id: 'winged', label: '羽翼', bg: 'bg-pink-950', border: 'border-pink-500', text: 'text-pink-400' },
  { id: 'fire', label: '烈火', bg: 'bg-orange-950', border: 'border-orange-500', text: 'text-orange-400' },
  { id: 'water', label: '水流', bg: 'bg-cyan-950', border: 'border-cyan-500', text: 'text-cyan-400' },
  { id: 'electric', label: '電力', bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400' },
  { id: 'poison', label: '劇毒', bg: 'bg-lime-950', border: 'border-lime-500', text: 'text-lime-400' },
  { id: 'mystery', label: '神秘', bg: 'bg-teal-950', border: 'border-teal-500', text: 'text-teal-400' },
  { id: 'giant', label: '巨大', bg: 'bg-rose-950', border: 'border-rose-500', text: 'text-rose-400' },
  { id: 'special', label: '特殊', bg: 'bg-fuchsia-950', border: 'border-fuchsia-500', text: 'text-fuchsia-400' },
];

export const MushroomModal: React.FC<MushroomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSpot,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<MushroomColor>('red');
  const [size, setSize] = useState<'normal' | 'large' | 'giant'>('normal');
  const [notes, setNotes] = useState('');

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
      <div className="w-full max-w-md bg-oled-card border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 標頭 */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <span>{editingSpot ? '編輯蘑菇點位' : '新增蘑菇點位'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 點位名稱 */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              蘑菇地點名稱 <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：大安公園噴水池、公司側門大蘑菇"
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 顏色與屬性選擇 */}
          <div>
            <label className="block text-neutral-300 font-medium mb-2">蘑菇屬性 / 顏色</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setColor(item.id)}
                  className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                    color === item.id
                      ? `${item.bg} ${item.border} ${item.text} ring-1 ring-emerald-400 shadow-md`
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
            <label className="block text-neutral-300 font-medium mb-1.5">蘑菇尺寸規格</label>
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
                      ? 'bg-neutral-800 border-emerald-500 text-emerald-400'
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
            <label className="block text-neutral-300 font-medium mb-1.5">備註筆記（選填）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：附近容易出紅色精華、建議帶紫色隊伍進攻"
              rows={2}
              className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* 提交按鈕 */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold transition-colors shadow-sm"
            >
              {editingSpot ? '儲存變更' : '新增點位'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
