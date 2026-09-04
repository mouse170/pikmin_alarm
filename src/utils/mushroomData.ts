import { MushroomCategory, MushroomTypeId, ColorMushroomType, ElementMushroomType, EventMushroomType } from '../types/mushroom';

export interface MushroomMeta {
  id: MushroomTypeId;
  name: string;
  category: MushroomCategory;
  categoryName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dispatchRule?: string; // 限定派遣規則
  description: string;
  isWeekendOnly?: boolean;
}

export const COLOR_MUSHROOMS: Record<ColorMushroomType, MushroomMeta> = {
  red: {
    id: 'red',
    name: '紅色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-red-950/50',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/60',
    description: '基礎色菇，派遣紅皮克敏可得攻擊力加成。',
  },
  yellow: {
    id: 'yellow',
    name: '黃色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-yellow-950/50',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-500/60',
    description: '基礎色菇，派遣黃皮克敏可得攻擊力加成。',
  },
  blue: {
    id: 'blue',
    name: '藍色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-blue-950/50',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/60',
    description: '基礎色菇，派遣藍皮克敏可得攻擊力加成。',
  },
  purple: {
    id: 'purple',
    name: '紫色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-purple-950/50',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/60',
    description: '基礎色菇，紫色皮克敏力量強大，克制力高。',
  },
  white: {
    id: 'white',
    name: '白色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-slate-800/60',
    badgeText: 'text-slate-200',
    badgeBorder: 'border-slate-400/60',
    description: '基礎色菇，派遣白皮克敏可得攻擊力加成。',
  },
  pink: {
    id: 'pink',
    name: '粉紅蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-pink-950/50',
    badgeText: 'text-pink-400',
    badgeBorder: 'border-pink-500/60',
    description: '基礎色菇，羽翼皮克敏具備同色加成。',
  },
  gray: {
    id: 'gray',
    name: '灰色蘑菇 (岩石)',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-zinc-800/60',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-400/60',
    description: '基礎色菇，岩石皮克敏攻擊力優異。',
  },
  ice: {
    id: 'ice',
    name: '冰藍色蘑菇',
    category: 'color',
    categoryName: '顏色菇',
    badgeBg: 'bg-cyan-950/50',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/60',
    description: '基礎色菇，冰霜皮克敏或水藍色主力克制。',
  },
};

export const ELEMENT_MUSHROOMS: Record<ElementMushroomType, MushroomMeta> = {
  fire: {
    id: 'fire',
    name: '火蘑菇',
    category: 'element',
    categoryName: '元素菇',
    badgeBg: 'bg-orange-950/60',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500',
    dispatchRule: '僅限派出紅皮克敏',
    description: '烈火燃燒的屬性蘑菇，其餘顏色皮克敏無法進入。',
  },
  water: {
    id: 'water',
    name: '水蘑菇',
    category: 'element',
    categoryName: '元素菇',
    badgeBg: 'bg-blue-950/60',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400',
    dispatchRule: '僅限派出藍皮克敏',
    description: '水流深浸的屬性蘑菇，僅能由不怕水的藍皮克敏出戰。',
  },
  electric: {
    id: 'electric',
    name: '電蘑菇',
    category: 'element',
    categoryName: '元素菇',
    badgeBg: 'bg-amber-950/60',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400',
    dispatchRule: '僅限派出黃皮克敏',
    description: '高壓放電屬性蘑菇，唯具備絕緣體質的黃皮克敏可討伐。',
  },
  poison: {
    id: 'poison',
    name: '毒蘑菇',
    category: 'element',
    categoryName: '元素菇',
    badgeBg: 'bg-lime-950/60',
    badgeText: 'text-lime-300',
    badgeBorder: 'border-lime-400',
    dispatchRule: '僅限派出白皮克敏',
    description: '劇毒沼氣籠罩之蘑菇，僅抗毒體質的白皮克敏能進入。',
  },
  crystal: {
    id: 'crystal',
    name: '水晶蘑菇',
    category: 'element',
    categoryName: '元素菇',
    badgeBg: 'bg-teal-950/60',
    badgeText: 'text-teal-300',
    badgeBorder: 'border-teal-400',
    dispatchRule: '僅限派出岩石皮克敏',
    description: '硬度極高的結晶蘑菇，唯有堅硬無比的岩石皮克敏方可擊碎。',
  },
};

export const EVENT_MUSHROOMS: Record<EventMushroomType, MushroomMeta> = {
  event_normal: {
    id: 'event_normal',
    name: '當月活動菇',
    category: 'event',
    categoryName: '活動菇',
    badgeBg: 'bg-fuchsia-950/60',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-400',
    description: '配合當月主題活動出現，通關可得專屬活動精華與特別道具。',
  },
  event_giant: {
    id: 'event_giant',
    name: '巨型活動菇',
    category: 'event',
    categoryName: '活動菇',
    badgeBg: 'bg-rose-950/70',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-400',
    description: '週末限定（每週六、日登場），血量龐大、參與人數上限高，通關獎勵最豐富。',
    isWeekendOnly: true,
  },
};

export const ALL_MUSHROOMS: Record<MushroomTypeId, MushroomMeta> = {
  ...COLOR_MUSHROOMS,
  ...ELEMENT_MUSHROOMS,
  ...EVENT_MUSHROOMS,
};

/**
 * 檢查目前是否為週末（週六 Day 6 或 週日 Day 0）
 */
export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/**
 * 取得蘑菇中繼資料
 */
export function getMushroomMeta(typeId: MushroomTypeId): MushroomMeta {
  return ALL_MUSHROOMS[typeId] || COLOR_MUSHROOMS.red;
}
