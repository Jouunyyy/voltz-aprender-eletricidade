import { getValidAccessToken, SUPABASE_KEY, SUPABASE_URL } from './supabase-client';
import { reportTelemetry } from './telemetry';

export type VideoProgressRow = {
  video_id: string;
  watched_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  completed: boolean;
  last_watched_at: string | null;
  updated_at?: string;
};

export type VideoProgressUpdate = Omit<VideoProgressRow, 'updated_at'>;

async function videoProgressFetch(path: string, init: RequestInit = {}) {
  const access = await getValidAccessToken();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${access}`,
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || 'Não foi possível guardar o progresso da videoaula.';
    reportTelemetry('supabase', `${response.status} ${message}`, 'video_progress');
    throw new Error(message);
  }
  return response;
}

export async function loadVideoProgress(userId: string): Promise<VideoProgressRow[]> {
  const response = await videoProgressFetch(
    `video_progress?user_id=eq.${encodeURIComponent(userId)}&select=video_id,watched_seconds,duration_seconds,progress_percent,completed,last_watched_at,updated_at&order=updated_at.desc`,
  );
  return response.json();
}

export async function saveVideoProgress(userId: string, progress: VideoProgressUpdate): Promise<void> {
  await videoProgressFetch('video_progress?on_conflict=user_id,video_id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    keepalive: true,
    body: JSON.stringify({
      user_id: userId,
      ...progress,
      updated_at: new Date().toISOString(),
    }),
  });
}
