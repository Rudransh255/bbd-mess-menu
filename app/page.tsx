'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from './components/shell';
import { indianNow, mealsAt, nextMeal, timeLabel } from '@/lib/meal-time';
import { menuForDay } from '@/lib/menu';

const dateFormat = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' });

export default function TodayPage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return <Shell><div className="page-wrap"><p className="eyebrow">BBD MESS / TODAY</p><div className="loading-card" role="status">Checking today’s meal service…</div></div></Shell>;

  const local = indianNow(now);
  const meals = mealsAt(local.weekday, local.minute);
  const live = meals.find(meal => meal.state === 'LIVE');
  const next = nextMeal(local.weekday, local.minute);
  const featured = live ? { ...live, tomorrow: false } : next;
  const featuredMenu = menuForDay(featured.tomorrow ? (local.weekday + 1) % 7 : local.weekday)[featured.name];
  const currentMenu = menuForDay(local.weekday);

  return <Shell><div className="page-wrap">
    <div className="page-kicker"><span>BBD MESS / TODAY</span><span>{dateFormat.format(now).toUpperCase()}</span></div>
    <section className={`hero ${live ? 'hero-live' : 'hero-next'}`} aria-labelledby="featured-meal">
      <div className="hero-top"><span className="status-stamp">{live ? '● LIVE NOW' : '◆ UP NEXT'}</span><span className="hero-time">{timeLabel(featured.start)} – {timeLabel(featured.end)}</span></div>
      <p className="hero-pretitle">{next.tomorrow && !live ? 'TOMORROW MORNING' : live ? 'CURRENTLY SERVING' : 'COMING UP AT THE MESS'}</p>
      <h1 id="featured-meal">{featured.name}</h1>
      <p className="hero-description">{live ? 'On the menu right now' : `Next service starts at ${timeLabel(featured.start)}`}</p>
      <div className="food-grid">{featuredMenu.map((item, index) => <span key={item} className={`food-chip food-${index % 4}`}>{item}</span>)}</div>
      <div className="hero-bottom"><span>GROUND FLOOR · DINING HALL</span><span>{live ? `ENDS ${timeLabel(featured.end)}` : 'SEE YOU SOON ↗'}</span></div>
    </section>

    <section className="section" aria-labelledby="schedule-heading">
      <div className="section-head"><div><p className="eyebrow">FOUR MEALS. ONE GOOD DAY.</p><h2 id="schedule-heading">Today’s schedule</h2></div><Link className="text-link" href="/week">FULL WEEK ↗</Link></div>
      <div className="meal-list">{meals.map(meal => <article key={meal.name} className={`meal-card ${meal.state === 'COMPLETED' ? 'meal-done' : ''} ${meal.state === 'LIVE' ? 'meal-active' : ''}`}>
        <div className="meal-card-top"><h3>{meal.name}</h3><span className={`meal-status status-${meal.state.toLowerCase()}`}>{meal.state === 'LIVE' ? 'LIVE NOW' : meal.state === 'UP_NEXT' ? 'UP NEXT' : meal.state}</span></div>
        <p className="meal-hours">{timeLabel(meal.start)} – {timeLabel(meal.end)}</p>
        <p className="meal-items">{currentMenu[meal.name].join(' · ')}</p>
      </article>)}</div>
    </section>

    <section className="feedback-callout"><div><p className="eyebrow">YOUR VOICE MATTERS</p><h2>How was the food?</h2><p>Tell us what worked and what could be better.</p></div><Link href="/feedback" className="primary-button">GIVE FEEDBACK ↗</Link></section>
    <p className="demo-note">Preview transcription of the hostel mess sheet effective 22 September 2026, pending verification. Salad may include any three of cucumber, onion, radish, tomato and beetroot. Check the mess notice for changes.</p>
  </div></Shell>;
}
