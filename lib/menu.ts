export const mealNames = ['Breakfast', 'Lunch', 'Evening Tea', 'Dinner'] as const;
export type MealName = (typeof mealNames)[number];

// Transcribed from the hostel mess sheet effective 22 September 2026.
// Index follows JavaScript weekdays: Sunday = 0, Monday = 1.
const weeklyMenus: Record<MealName, string[]>[] = [
  {
    Breakfast: ['Chana dal kachori', 'Hari chutney', 'Milk 200 ml', 'Tea', '2 bananas'],
    Lunch: ['Tehri', 'Aloo tamatar sabzi', 'Hari chutney', 'Dahi', 'Papad', 'Salad', 'Achaar', 'Roti'],
    'Evening Tea': ['Chana masala', 'Tea'],
    Dinner: ['Arhar dal tadka', 'Kashmiri dum aloo', 'Egg curry (2 eggs)', 'Rice', 'Roti', 'Salad', 'Achaar', '2 jalebis'],
  },
  {
    Breakfast: ['Ajwain paratha', 'Matar chola', 'Tea', 'Milk 200 ml', '2 bananas'],
    Lunch: ['Black masoor dal', 'Lauki jeera sabzi', 'Rice', 'Boondi raita', 'Salad', 'Achaar', 'Roti'],
    'Evening Tea': ['Vegetable chowmein', 'Sauce', 'Tea'],
    Dinner: ['Mixed dal', 'Aloo lobiya sabzi', 'Roti', 'Rice', 'Salad', 'Achaar', 'Balushahi'],
  },
  {
    Breakfast: ['Vegetable suji upma', '4 slices bread and butter', 'Milk 200 ml', 'Tea', '2 bananas'],
    Lunch: ['Arhar dal', 'Aloo pyaz sabzi', 'Kheera raita', 'Rice', 'Salad', 'Achaar', 'Roti'],
    'Evening Tea': ['Namakpara', 'Tea'],
    Dinner: ['Chola', 'Aloo jeera', 'Poori or bhatura', 'Jeera rice', 'Salad', 'Achaar', '1 ice cream'],
  },
  {
    Breakfast: ['Aloo paratha with hari chutney', 'Meethi dahiya', 'Tea', '2 bananas', '2 eggs'],
    Lunch: ['Paneer butter masala', 'Dal panchmel', 'Boondi raita', 'Rice', 'Roti', 'Salad', 'Achaar'],
    'Evening Tea': ['Matar chaat with onion, chilli and meethi chutney or vegetable pasta with sauce', 'Tea'],
    Dinner: ['Arhar dal', 'Aloo-soyabean sabzi', 'Roti', 'Rice', 'Salad', 'Achaar', 'Meethi boondi'],
  },
  {
    Breakfast: ['Vegetable poha', 'Sprouts', 'Cornflakes', 'Tea', 'Milk 200 ml', '2 bananas'],
    Lunch: ['Kadhi pakoda', 'Aloo jeera with kasuri methi', 'Rice', 'Salad', 'Achaar', 'Roti'],
    'Evening Tea': ['Bhelpuri', 'Tea'],
    Dinner: ['Lauki chana dal', 'Aloo parval sukhi sabzi', 'Roti', 'Rice', 'Salad', 'Achaar', 'Rice kheer'],
  },
  {
    Breakfast: ['Poori', 'Aloo matar tamatar sabzi', 'Tea', 'Milk 200 ml', '2 bananas'],
    Lunch: ['Rajma masala', 'Mixed vegetables', 'Rice', 'Kheera raita', 'Salad', 'Achaar', 'Roti'],
    'Evening Tea': ['2 samosas', 'Meethi chutney', 'Tea'],
    Dinner: ['Matar paneer', 'Veg biryani', 'Boondi raita', 'Salad', 'Achaar', 'Roti', 'Fruit custard'],
  },
  {
    Breakfast: ['Idli sambar', 'Milk 200 ml', 'Tea', 'Cornflakes', '2 bananas'],
    Lunch: ['Arhar dal', 'Aloo parval', 'Roti', 'Rice', 'Boondi raita', 'Salad', 'Achaar'],
    'Evening Tea': ['2 aloo matar sandwiches', 'Sauce', 'Tea'],
    Dinner: ['Black masoor dal', 'Lauki kofta', 'Roti', 'Rice', 'Salad', 'Achaar', 'Suji halwa'],
  },
];

export function menuForDay(weekday: number): Record<MealName, string[]> {
  return weeklyMenus[weekday];
}
