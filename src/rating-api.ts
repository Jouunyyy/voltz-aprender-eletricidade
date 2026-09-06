import { getValidAccessToken, SUPABASE_KEY, SUPABASE_URL } from './supabase-client';

export type RatingPromptState={answered:boolean;defer_count:number;last_deferred_completed_count:number};

async function ratingFetch(path:string,init:RequestInit={}){
  const token=await getValidAccessToken();
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    ...init,
    headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,Accept:'application/json',...(init.headers||{})},
  });
  if(!response.ok){
    const data=await response.json().catch(()=>({}));
    throw new Error(data.message||'Não foi possível guardar a avaliação.');
  }
  return response;
}

export async function loadRatingEligibility(userId:string){
  const [progressRes,ratingRes,stateRes]=await Promise.all([
    ratingFetch(`progress?user_id=eq.${encodeURIComponent(userId)}&select=completed_lessons`),
    ratingFetch(`app_ratings?user_id=eq.${encodeURIComponent(userId)}&is_test=eq.false&select=id&limit=1`),
    ratingFetch(`rating_prompt_state?user_id=eq.${encodeURIComponent(userId)}&select=answered,defer_count,last_deferred_completed_count`),
  ]);
  const progress=await progressRes.json();
  const ratings=await ratingRes.json();
  const states=await stateRes.json();
  const completedLessons:Array<string>=progress[0]?.completed_lessons||[];
  const completedCount=completedLessons.filter(id=>id.startsWith('course-')).length;
  const state:RatingPromptState=states[0]||{answered:false,defer_count:0,last_deferred_completed_count:0};
  const hasRealRating=Boolean(ratings[0]);
  const eligible=!hasRealRating&&!state.answered&&state.defer_count<3&&(
    state.defer_count===0?completedCount>=2:completedCount>=state.last_deferred_completed_count+3
  );
  return {eligible,completedCount,state,hasRealRating};
}

export async function submitRating(userId:string,rating:number,isTest:boolean){
  await ratingFetch('app_ratings',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:userId,rating,is_test:isTest})});
  if(!isTest){
    await ratingFetch('rating_prompt_state?on_conflict=user_id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:userId,answered:true,updated_at:new Date().toISOString()})});
  }
}

export async function deferRating(userId:string,completedCount:number,state:RatingPromptState){
  const deferCount=Math.min(3,state.defer_count+1);
  await ratingFetch('rating_prompt_state?on_conflict=user_id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:userId,answered:false,defer_count:deferCount,last_deferred_completed_count:completedCount,updated_at:new Date().toISOString()})});
  return deferCount;
}
