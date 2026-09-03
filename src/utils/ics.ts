/**
 * 產生標準 iCalendar (.ics) 檔案並觸發下載或系統開啟
 */
export function exportMushroomToCalendar(params: {
  title: string;
  notes?: string;
  targetTimeMs: number;
}): void {
  const startDate = new Date(params.targetTimeMs);
  const endDate = new Date(params.targetTimeMs + 10 * 60 * 1000); // 預設保留 10 分鐘區間

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const startIso = formatDate(startDate);
  const endIso = formatDate(endDate);
  const nowIso = formatDate(new Date());

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
    `DESCRIPTION:${params.notes || '蘑菇已重生，請立即登入皮克敏 Bloom 派兵挑戰！'}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M', // 準時提醒
    'ACTION:DISPLAY',
    `DESCRIPTION:蘑菇 ${params.title} 已出現！`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
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
