import { MushroomSpot, DailyQuota, UserSettings } from '../types/mushroom';
import { isWeekend } from './mushroomData';

const STORAGE_KEYS = {
  SPOTS: 'pikmin_mushroom_spots_v2',
  QUOTA: 'pikmin_daily_quota_v2',
  SETTINGS: 'pikmin_user_settings_v2',
};

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_DEMO_SPOTS: MushroomSpot[] = [
  {
    id: 'demo-1',
    name: '大安森林公園音樂台',
    category: 'color',
    typeId: 'red',
    size: 'large',
    notes: '常規出紅、粉色蘑菇，打完 5 分鐘後重生',
    status: 'cooldown',
    cooldownEndTime: Date.now() + 2 * 60 * 1000 + 30 * 1000, // 剩餘 2 分半（進入 1~3 分鐘提前警示區）
    createdAt: Date.now() - 100000,
    updatedAt: Date.now(),
  },
  {
    id: 'demo-2',
    name: '台北車站南門廣場',
    category: 'element',
    typeId: 'fire',
    size: 'giant',
    notes: '烈火蘑菇：僅限派出紅皮克敏進攻',
    status: 'battling',
    battleEndTime: Date.now() + 20 * 60 * 1000,
    createdAt: Date.now() - 200000,
    updatedAt: Date.now(),
  },
  {
    id: 'demo-3',
    name: '捷運站出口噴水池',
    category: 'event',
    typeId: isWeekend() ? 'event_giant' : 'event_normal',
    size: 'normal',
    notes: isWeekend()
      ? '週末限定巨型活動菇：獎勵豐富、血量多'
      : '當月主題活動菇：提供活動專屬精華與道具',
    status: 'ready',
    createdAt: Date.now() - 300000,
    updatedAt: Date.now(),
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  oledHudMode: false,
  autoCooldownMinutes: 5, // 修正：蘑菇被打掉重生時間為 5 分鐘
  advanceWarningMinutes: 2, // 修正：接近 1~3 分鐘（預設 2 分鐘）提前執行提醒
  theme: 'oled',
};

export function loadSpots(): MushroomSpot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPOTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('讀取蘑菇點位失敗：', error);
    return [];
  }
}

export function saveSpots(spots: MushroomSpot[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots));
  } catch (error) {
    console.error('儲存蘑菇點位失敗：', error);
  }
}

export function loadDailyQuota(): DailyQuota {
  const today = getTodayString();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTA);
    if (raw) {
      const parsed: DailyQuota = JSON.parse(raw);
      if (parsed.lastResetDate === today) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('讀取每日額度失敗：', error);
  }

  // 跨日自動重置為 3 次
  const initialQuota: DailyQuota = {
    remaining: 3,
    lastResetDate: today,
  };
  saveDailyQuota(initialQuota);
  return initialQuota;
}

export function saveDailyQuota(quota: DailyQuota): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
  } catch (error) {
    console.error('儲存每日額度失敗：', error);
  }
}

export function checkAndResetDailyQuota(currentQuota: DailyQuota): DailyQuota {
  const today = getTodayString();
  if (currentQuota.lastResetDate !== today) {
    const resetQuota: DailyQuota = {
      remaining: 3,
      lastResetDate: today,
    };
    saveDailyQuota(resetQuota);
    return resetQuota;
  }
  return currentQuota;
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('儲存使用者偏好設定失敗：', error);
  }
}
