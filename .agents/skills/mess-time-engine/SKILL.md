---
name: mess-time-engine
description: Implement or test meal schedules, status transitions, and next-meal behaviour for the hostel mess app.
---

# Mess Time Engine

Application timezone: `Asia/Kolkata`.

Monday to Friday:

- Breakfast: 08:00 to 09:00
- Lunch: 13:00 to 14:00
- Evening Tea: 17:00 to 18:00
- Dinner: 20:00 to 21:00

Saturday and Sunday:

- Breakfast: 08:30 to 09:30
- Lunch: 13:00 to 14:00
- Evening Tea: 17:00 to 18:00
- Dinner: 20:00 to 21:00

Meal states: `LIVE`, `UP_NEXT`, `LATER`, `COMPLETED`, and `CLOSED`.

Use one shared meal-status utility. Never duplicate time calculation logic in multiple UI components. After dinner finishes, show tomorrow's breakfast as the next meal. Write tests for boundary times.

Important boundaries:

- Weekday 07:59: Breakfast `UP_NEXT`
- Weekday 08:00: Breakfast `LIVE`
- Weekday 08:59: Breakfast `LIVE`
- Weekday 09:00: Breakfast `COMPLETED`
- Weekend 08:29: Breakfast `UP_NEXT`
- Weekend 08:30: Breakfast `LIVE`
- Weekend 09:29: Breakfast `LIVE`
- Weekend 09:30: Breakfast `COMPLETED`
