/**
 * 產生標準 iCalendar (.ics) 檔案並觸發下載或系統開啟
 * 包含提前 2 分鐘（接近 1~3 分鐘區間）之原生行事曆鬧鐘提醒
 */
export function exportMushroomToCalendar(params: {
  title: string;
  notes?: string;
  targetTimeMs: number;
  advanceMinutes?: number;
}): void {
  const startDate = new Date(params.targetTimeMs);
  const endDate = new Date(params.targetTimeMs + 5 * 60 * 1000); // 預設 5 分鐘區間

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startIso = formatDate(startDate);
  const endIso = formatDate(endDate);
  const nowIso = formatDate(new Date());
  const advanceMin = params.advanceMinutes ?? 2; // 預設提前 2 分鐘提醒

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pikmin Mushroom Tracker//ZH-TW',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:pikmin-mushroom-${params.targetTimeMs}-${Math.random().toString(36).substring(2, 9)}@github.io`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:🍄 皮克敏蘑菇：${params.title}`,
    `DESCRIPTION:${params.notes || '蘑菇即將於 2 分鐘後重生，請準備登入皮克敏 Bloom 派兵討伐！'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${advanceMin}M`, // 提前 1~3 分鐘（預設 2 分鐘）鬧鐘響鈴
    'ACTION:DISPLAY',
    `DESCRIPTION:【皮克敏提前提醒】${params.title} 將於 ${advanceMin} 分鐘後出現！`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M', // 準時提醒
    'ACTION:DISPLAY',
    `DESCRIPTION:【皮克敏準時提醒】${params.title} 已出現，立即進攻！`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `pikmin-${params.title.replace(/\s+/g, '_')}-${startDate.getTime()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
