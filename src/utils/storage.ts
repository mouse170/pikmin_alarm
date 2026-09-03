import { MushroomSpot, DailyQuota, UserSettings } from '../types/mushroom';

const STORAGE_KEYS = {
  SPOTS: 'pikmin_mushroom_spots_v1',
  QUOTA: 'pikmin_daily_quota_v1',
  SETTINGS: 'pikmin_user_settings_v1',
};

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_DEMO_SPOTS: MushroomSpot[] = [
  {
    id: 'demo-1',
    name: '大安森林公園中央池',
    color: 'red',
    size: 'large',
    notes: '常規出紅、粉色蘑菇，打完約 15 分鐘重生',
    status: 'cooldown',
    cooldownEndTime: Date.now() + 8 * 60 * 1000 + 30 * 1000, // 剩餘 8 分半
    createdAt: Date.now() - 100000,
    updatedAt: Date.now()
  },
  {
    id: 'demo-2',
    name: '台北車站南門廣場',
    color: 'purple',
    size: 'giant',
    notes: '正在進攻中，隊友支援中',
    status: 'battling',
    battleEndTime: Date.now() + 24 * 60 * 1000, // 剩餘 24 分鐘結束
    createdAt: Date.now() - 200000,
    updatedAt: Date.now()
  },
  {
    id: 'demo-3',
    name: '公司大樓前裝置藝術',
    color: 'mystery',
    size: 'normal',
    notes: '活動限定神秘蘑菇，隨時可發起進攻',
    status: 'ready',
    createdAt: Date.now() - 300000,
    updatedAt: Date.now()
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  oledHudMode: false,
  autoCooldownMinutes: 15,
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
    lastResetDate: today
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
