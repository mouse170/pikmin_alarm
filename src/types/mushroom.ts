export type MushroomStatus = 'idle' | 'battling' | 'cooldown' | 'ready';

export type MushroomColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'white'
  | 'rock'
  | 'winged'
  | 'fire'
  | 'water'
  | 'electric'
  | 'poison'
  | 'mystery'
  | 'giant'
  | 'special';

export interface MushroomSpot {
  id: string;
  name: string;
  color: MushroomColor;
  size?: 'normal' | 'large' | 'giant';
  notes?: string;
  status: MushroomStatus;
  
  // 正在打（戰鬥結束時間）
  battleEndTime?: number | null;
  
  // 剛打完（15 分鐘重生冷卻時間）
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
  autoCooldownMinutes: number; // 預設 15 分鐘
  theme: 'oled' | 'light'; // 主題模式
}
