'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { MealName } from '@/lib/menu';

export type RatingCount = { rating:number; total:number };
const mealTypes:Record<MealName,string>={Breakfast:'breakfast',Lunch:'lunch','Evening Tea':'evening_tea',Dinner:'dinner'};
const validDate=/^\d{4}-\d{2}-\d{2}$/;

export async function getRatingCounts(meal:MealName,date:string):Promise<{counts:RatingCount[];error?:string}> {
  if(!mealTypes[meal]||!validDate.test(date)) return {counts:[],error:'Choose a valid meal.'};
  try { const supabase=await createClient(); const {data,error}=await supabase.rpc('get_daily_rating_counts',{p_service_date:date,p_meal_type:mealTypes[meal]});
    if(error) return {counts:[],error:'Rating totals are temporarily unavailable.'};
    return {counts:(data??[]).map(({rating,total}:{rating:number;total:number|string})=>({rating:Number(rating),total:Number(total)}))};
  } catch { return {counts:[],error:'Rating totals are temporarily unavailable.'}; }
}

export async function submitRating(meal:MealName,date:string,rating:number):Promise<{counts:RatingCount[];error?:string}> {
  if(!mealTypes[meal]||!validDate.test(date)||!Number.isInteger(rating)||rating<1||rating>5) return {counts:[],error:'Choose a rating from 1 to 5.'};
  const jar=await cookies(); let voterId=jar.get('bbd-rating-id')?.value;
  if(!voterId||!/^[0-9a-f-]{36}$/i.test(voterId)){voterId=crypto.randomUUID();jar.set('bbd-rating-id',voterId,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:31536000});}
  try { const supabase=await createClient(); const {data,error}=await supabase.rpc('submit_daily_rating',{p_service_date:date,p_meal_type:mealTypes[meal],p_rating:rating,p_voter_id:voterId});
    if(error) return {counts:[],error:'Your rating could not be saved. Please try again.'};
    return {counts:(data??[]).map(({rating:score,total}:{rating:number;total:number|string})=>({rating:Number(score),total:Number(total)}))};
  } catch { return {counts:[],error:'Your rating could not be saved. Please try again.'}; }
}
