export type MushroomCategory = 'color' | 'element' | 'event';

// 1. 顏色菇（基礎色菇）：紅、黃、藍、紫、白、粉紅、灰色（岩石）、冰藍色
export type ColorMushroomType =
  | 'red'
  | 'yellow'
  | 'blue'
  | 'purple'
  | 'white'
  | 'pink'
  | 'gray'
  | 'ice';

// 2. 元素菇（屬性菇）：火、水、電、毒、水晶
export type ElementMushroomType =
  | 'fire'
  | 'water'
  | 'electric'
  | 'poison'
  | 'crystal';

// 3. 活動菇與巨型活動菇：當月活動菇、週末巨型活動菇
export type EventMushroomType =
  | 'event_normal'
  | 'event_giant';

export type MushroomTypeId = ColorMushroomType | ElementMushroomType | EventMushroomType;

export type MushroomStatus = 'idle' | 'battling' | 'cooldown' | 'ready';

export interface MushroomSpot {
  id: string;
  name: string;
  category: MushroomCategory;
  typeId: MushroomTypeId;
  size?: 'normal' | 'large' | 'giant';
  notes?: string;
  status: MushroomStatus;

  // 正在打（戰鬥結束時間）
  battleEndTime?: number | null;

  // 剛打完（5 分鐘重生冷卻時間）
  cooldownEndTime?: number | null;

  // 建立與更新戳記
  createdAt: number;
  updatedAt: number;
}

export interface DailyQuota {
  remaining: number; // 預設 3 次
  lastResetDate: string; // YYYY-MM-DD
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  oledHudMode: boolean;
  autoCooldownMinutes: number; // 預設 5 分鐘
  advanceWarningMinutes: number; // 預設 1~3 分鐘（預設 2 分鐘）提前提醒
  theme: 'oled' | 'light';
}
