'use client';

import { useState, type FormEvent } from 'react';
import { Shell } from '../components/shell';
import { mealNames, type MealName } from '@/lib/menu';

type SavedFeedback = { meal: MealName; rating: number; comment: string; savedAt: string };
const ratings = ['Poor', 'Fair', 'Okay', 'Good', 'Excellent'];

export default function FeedbackPage() {
  const [meal, setMeal] = useState<MealName>('Lunch');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) { setError('Choose a rating before saving.'); return; }
    try {
      const entry: SavedFeedback = { meal, rating, comment: comment.trim(), savedAt: new Date().toISOString() };
      const current = JSON.parse(localStorage.getItem('bbd-mess-feedback-preview') || '[]') as SavedFeedback[];
      localStorage.setItem('bbd-mess-feedback-preview', JSON.stringify([...current, entry]));
      setSaved(true); setError(''); setComment(''); setRating(0);
    } catch { setError('Could not save on this device. Check your browser storage settings.'); }
  }

  return <Shell><div className="page-wrap feedback-page">
    <div className="page-kicker"><span>BBD MESS / FEEDBACK</span><span>YOUR OPINION COUNTS</span></div>
    <div className="page-title"><p className="eyebrow">TELL US STRAIGHT</p><h1>How was<br /><span>your meal?</span></h1><p>Rate the food and leave a note.</p></div>
    <div className="notice" role="note"><strong>Preview mode</strong><span>Feedback is saved only on this device until the Supabase backend is connected. It is not sent to mess staff yet.</span></div>
    {saved && <div className="success-message" role="status">Saved on this device. Thanks for sharing your thoughts.</div>}
    <form className="feedback-form" onSubmit={submit}>
      <label htmlFor="meal">01 / WHICH MEAL?</label>
      <select id="meal" value={meal} onChange={event => { setMeal(event.target.value as MealName); setSaved(false); }}>{mealNames.map(name => <option key={name}>{name}</option>)}</select>
      <fieldset><legend>02 / HOW WAS IT?</legend><div className="rating-grid">{ratings.map((label, index) => <button key={label} type="button" aria-pressed={rating === index + 1} className={rating === index + 1 ? 'selected' : ''} onClick={() => { setRating(index + 1); setSaved(false); setError(''); }}><strong>{index + 1}</strong><span>{label}</span></button>)}</div></fieldset>
      <label htmlFor="comment">03 / ANYTHING ELSE? <span>(OPTIONAL)</span></label>
      <textarea id="comment" value={comment} onChange={event => { setComment(event.target.value); setSaved(false); }} maxLength={500} rows={5} placeholder="What did you enjoy? What should change?" />
      <p className="character-count">{comment.length}/500 CHARACTERS</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="primary-button">SAVE FEEDBACK ON THIS DEVICE ↗</button>
    </form>
  </div></Shell>;
}
