import { mealNames, type MealName } from './menu.ts';

export type MealState = 'LIVE' | 'UP_NEXT' | 'LATER' | 'COMPLETED' | 'CLOSED';
export type Meal = { name: MealName; start: number; end: number; state: MealState };

const timezone = 'Asia/Kolkata';
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function indianNow(date: Date) {
  const parts = Object.fromEntries(clock.formatToParts(date).map(({ type, value }) => [type, value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return {
    year, month, day,
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    minute: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function mealSchedule(weekday: number) {
  const weekend = weekday === 0 || weekday === 6;
  return [
    { name: mealNames[0], start: weekend ? 510 : 480, end: weekend ? 570 : 540 },
    { name: mealNames[1], start: 780, end: 840 },
    { name: mealNames[2], start: 1020, end: 1080 },
    { name: mealNames[3], start: 1200, end: 1260 },
  ];
}

export function mealsAt(weekday: number, minute: number): Meal[] {
  const schedule = mealSchedule(weekday);
  const live = schedule.findIndex(({ start, end }) => minute >= start && minute < end);
  const next = schedule.findIndex(({ start }) => minute < start);
  return schedule.map((meal, index) => ({
    ...meal,
    state: live === index ? 'LIVE' : minute >= meal.end ? 'COMPLETED'
      : next === index ? 'UP_NEXT' : 'LATER',
  }));
}

export function nextMeal(weekday: number, minute: number) {
  const today = mealsAt(weekday, minute).find(({ state }) => state === 'UP_NEXT');
  if (today) return { ...today, tomorrow: false };
  const breakfast = mealSchedule((weekday + 1) % 7)[0];
  return { ...breakfast, state: 'UP_NEXT' as const, tomorrow: true };
}

export function timeLabel(minute: number) {
  const hour = Math.floor(minute / 60);
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
