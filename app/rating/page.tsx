'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../components/shell';
import { mealNames, type MealName } from '@/lib/menu';
import { indianNow } from '@/lib/meal-time';
import { getRatingCounts, submitRating, type RatingCount } from './actions';

const labels=['Poor','Fair','Okay','Good','Excellent'];
const local=indianNow(new Date());
const today=`${local.year}-${String(local.month).padStart(2,'0')}-${String(local.day).padStart(2,'0')}`;

export default function RatingPage(){
  const [meal,setMeal]=useState<MealName>('Lunch'); const [counts,setCounts]=useState<RatingCount[]>([]); const [selected,setSelected]=useState(0); const [message,setMessage]=useState(''); const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;getRatingCounts(meal,today).then(result=>{if(active){setCounts(result.counts);setMessage(result.error??'');setLoading(false);}});return()=>{active=false};},[meal]);
  async function rate(score:number){setLoading(true);setMessage('');const result=await submitRating(meal,today,score);setCounts(result.counts);setSelected(result.error?0:score);setMessage(result.error??'Rating saved. You can change it at any time.');setLoading(false);}
  return <Shell><div className="page-wrap rating-page"><div className="page-kicker"><span>BBD MESS / RATINGS</span><span>COMMUNITY SCORE</span></div><div className="page-title"><p className="eyebrow">ONE TAP ONLY</p><h1>Rate your<br/><span>meal.</span></h1><p>Choose a meal and rate it from 1 to 5. The totals update for everyone.</p></div><section className="rating-form"><label htmlFor="meal">WHICH MEAL?</label><select id="meal" value={meal} onChange={event=>{setLoading(true);setMeal(event.target.value as MealName);setSelected(0);setMessage('');}}>{mealNames.map(name=><option key={name}>{name}</option>)}</select><fieldset disabled={loading}><legend>YOUR RATING</legend><div className="rating-grid">{labels.map((label,index)=>{const score=index+1;const total=counts.find(item=>item.rating===score)?.total??0;return <button key={label} type="button" aria-pressed={selected===score} className={selected===score?'selected':''} onClick={()=>rate(score)}><strong>{score}</strong><span>{label}</span><small>{total} {total===1?'person':'people'}</small></button>})}</div></fieldset>{loading&&<p role="status" className="rating-message">Loading ratings…</p>}{!loading&&message&&<p role={message.startsWith('Rating saved')?'status':'alert'} className="rating-message">{message}</p>}</section></div></Shell>;
}
