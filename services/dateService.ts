/**
 * Official Chile Date Service
 * Synchronizes with official network time APIs for Chile (America/Santiago)
 * and provides fallback to local system clock with forced Chile timezone conversion.
 * Completely eliminates UTC offset flickers and day mismatches.
 */

let timeOffsetMs = 0;
let isSynced = false;

export async function syncChileTimeWithInternet(): Promise<void> {
  if (isSynced) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://worldtimeapi.org/api/timezone/America/Santiago', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.datetime) {
        const internetMs = new Date(data.datetime).getTime();
        timeOffsetMs = internetMs - Date.now();
        isSynced = true;
        console.log('[dateService] Synced with official Chile internet time. Offset:', timeOffsetMs, 'ms');
        return;
      }
    }
  } catch (err) {
    // Secondary fallback fetch if primary API fails
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);
      const res2 = await fetch('https://timeapi.io/api/time/current/zone?timeZone=America/Santiago', {
        signal: controller2.signal
      });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.year && data2.month && data2.day) {
          const internetDate = new Date(data2.year, data2.month - 1, data2.day, data2.hour, data2.minute, data2.seconds || 0);
          timeOffsetMs = internetDate.getTime() - Date.now();
          isSynced = true;
          console.log('[dateService] Synced via secondary Chile time API. Offset:', timeOffsetMs, 'ms');
          return;
        }
      }
    } catch (e) {
      console.warn('[dateService] Time API unreachable, using local system clock with forced Chile timezone conversion.');
    }
  }
}

// Trigger background sync immediately on load
syncChileTimeWithInternet();

/**
 * Returns current Date object adjusted by official network time offset.
 */
export function getChileDate(): Date {
  return new Date(Date.now() + timeOffsetMs);
}

/**
 * Returns YYYY-MM-DD in America/Santiago timezone.
 * Prevents UTC day shifts (e.g. at 20:00-23:59 local time).
 */
export function getChileYMD(d?: Date): string {
  const targetDate = d || getChileDate();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(targetDate);

  const year = parts.find(p => p.type === 'year')?.value || String(targetDate.getFullYear());
  const month = parts.find(p => p.type === 'month')?.value || String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = parts.find(p => p.type === 'day')?.value || String(targetDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Returns DD/MM/YYYY or DD-MM-YYYY in America/Santiago timezone.
 */
export function getChileDDMMYYYY(d?: Date, separator: string = '/'): string {
  const targetDate = d || getChileDate();
  const parts = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(targetDate);

  const year = parts.find(p => p.type === 'year')?.value || String(targetDate.getFullYear());
  const month = parts.find(p => p.type === 'month')?.value || String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = parts.find(p => p.type === 'day')?.value || String(targetDate.getDate()).padStart(2, '0');

  return `${day}${separator}${month}${separator}${year}`;
}
