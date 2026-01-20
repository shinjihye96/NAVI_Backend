/**
 * 한국 시간(KST) 유틸리티
 * UTC+9
 */

const KST_OFFSET = 9 * 60 * 60 * 1000; // 9시간 (밀리초)

/**
 * 현재 한국 시간 Date 객체 반환
 */
export function getKSTNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + KST_OFFSET);
}

/**
 * 한국 시간 기준 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export function getKSTDateString(date?: Date): string {
  const kstDate = date ? new Date(date.getTime() + KST_OFFSET) : getKSTNow();
  return kstDate.toISOString().split('T')[0];
}

/**
 * 한국 시간 기준 오늘의 시작 (00:00:00)
 */
export function getKSTStartOfDay(date?: Date): Date {
  const dateStr = getKSTDateString(date);
  return new Date(dateStr + 'T00:00:00+09:00');
}

/**
 * 한국 시간 기준 오늘의 끝 (23:59:59.999)
 */
export function getKSTEndOfDay(date?: Date): Date {
  const dateStr = getKSTDateString(date);
  return new Date(dateStr + 'T23:59:59.999+09:00');
}

/**
 * 한국 시간 기준 올해의 몇 번째 날인지 계산
 */
export function getKSTDayOfYear(date?: Date): number {
  const kstDate = date ? new Date(date.getTime() + KST_OFFSET) : getKSTNow();
  const startOfYear = new Date(kstDate.getFullYear(), 0, 0);
  const diff = kstDate.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 한국 시간 기준 자정까지 남은 시간
 */
export function getKSTRemainingTime(): { hours: number; minutes: number } {
  const now = new Date();
  const kstEndOfDay = getKSTEndOfDay();
  const remainingMs = kstEndOfDay.getTime() - now.getTime();

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
