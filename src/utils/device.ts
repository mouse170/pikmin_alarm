/**
 * 裝置與作業系統偵測工具
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

export function getDeviceType(): 'ios' | 'android' | 'desktop' {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'desktop';
}

/**
 * 呼叫 iOS 原生捷徑以設定計時器
 * @param minutes 倒數分鐘數（例如 3 或 5 分鐘）
 * @param shortcutName 捷徑名稱，預設為「皮克敏計時器」
 */
export function triggerIOSShortcutTimer(minutes: number, shortcutName = '皮克敏計時器'): void {
  const roundedMinutes = Math.max(1, Math.round(minutes));
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}&input=${roundedMinutes}`;
  window.location.href = url;
}
