'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../components/shell';
import { indianNow, mealSchedule, timeLabel } from '@/lib/meal-time';
import { menuForDay } from '@/lib/menu';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeekPage() {
  const [today, setToday] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setToday(indianNow(new Date()).weekday), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const day = selected ?? today ?? 1;
  const schedule = mealSchedule(day);
  const menu = menuForDay(day);

  return <Shell><div className="page-wrap">
    <div className="page-kicker"><span>BBD MESS / WEEK</span><span>7 DAYS · 4 MEALS</span></div>
    <div className="page-title"><p className="eyebrow">PLAN YOUR PLATE</p><h1>Weekly mess<br /><span>timetable.</span></h1><p>Pick a day to see every meal and its serving time.</p></div>
    <div className="day-tabs" role="group" aria-label="Choose day">
      {[1,2,3,4,5,6,0].map(index => <button key={index} type="button" className={day === index ? 'selected' : ''} aria-pressed={day === index} onClick={() => setSelected(index)}>{days[index].slice(0, 3).toUpperCase()}{today === index && <small>TODAY</small>}</button>)}
    </div>
    <section className="section" aria-labelledby="day-heading"><div className="section-head"><div><p className="eyebrow">{day === 0 ? 'SUNDAY SPECIAL' : day === 6 ? 'WEEKEND MENU' : 'WEEKDAY MENU'}</p><h2 id="day-heading">{days[day]}</h2></div><span className="count-badge">04 MEALS</span></div>
      <div className="week-grid">{schedule.map((meal, index) => <article className="week-card" key={meal.name}><div className="week-card-number">0{index + 1}</div><div className="week-card-body"><div className="meal-card-top"><h3>{meal.name}</h3><span className="week-time">{timeLabel(meal.start)} – {timeLabel(meal.end)}</span></div><ul>{menu[meal.name].map(item => <li key={item}>{item}</li>)}</ul></div></article>)}</div>
    </section>
    <p className="demo-note">Preview transcription of the hostel mess sheet effective 22 September 2026, pending verification. Salad may include any three of cucumber, onion, radish, tomato and beetroot. Check the mess notice for changes.</p>
  </div></Shell>;
}
