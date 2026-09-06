import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight, CirclePlay, Clock3, GraduationCap, Play, Sparkles, Star, Trophy, Wrench, Zap } from 'lucide-react';
import { videoLessonCategories, type VideoLesson, type VideoLessonCategory } from './video-lessons';
import { loadVideoProgress, saveVideoProgress, type VideoProgressRow } from './video-progress-api';
import './voltz-videoaulas.css';

type User = { id: string; name: string; email: string; avatar?: string };
type Props = { user: User; onExit: () => void; onOpenLevel: (levelId: string) => void; onChallenge: (levelId: string) => void };
type Page = { kind: 'home' } | { kind: 'category'; categoryId: string } | { kind: 'lesson'; categoryId: string; videoId: string };
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const icons = [GraduationCap, Wrench, Zap, Trophy, Star];
const scrollVideoTop = () => requestAnimationFrame(() => document.querySelector<HTMLElement>('.video-role-area')?.scrollTo({ top: 0, left: 0, behavior: 'auto' }));

export default function VoltzVideoaulas({ user, onExit, onOpenLevel, onChallenge }: Props) {
  const [page, setPage] = useState<Page>({ kind: 'home' });
  const [rows, setRows] = useState<VideoProgressRow[]>([]);
  const [progressError, setProgressError] = useState('');
  const progress = useMemo(() => new Map(rows.map((row) => [row.video_id, row])), [rows]);
  const navigate = (next: Page) => { setPage(next); scrollVideoTop(); };
  const refresh = async () => {
    try { setRows(await loadVideoProgress(user.id)); setProgressError(''); }
    catch { setProgressError('Não foi possível carregar o progresso das videoaulas.'); }
  };
  useEffect(() => { void refresh(); }, [user.id]);
  const completedTotal = rows.filter((row) => row.completed).length;
  const category = page.kind !== 'home' ? videoLessonCategories.find((item) => item.id === page.categoryId) : undefined;
  const lesson = page.kind === 'lesson' ? category?.videos.find((item) => item.id === page.videoId) : undefined;
  return <section className="video-shell">
    {page.kind === 'home' && <VideoHome completedTotal={completedTotal} progress={progress} onOpen={(categoryId) => navigate({ kind: 'category', categoryId })} onExit={onExit} error={progressError} />}
    {page.kind === 'category' && category && <VideoCategoryPage category={category} progress={progress} onBack={() => navigate({ kind: 'home' })} onOpen={(videoId) => navigate({ kind: 'lesson', categoryId: category.id, videoId })} error={progressError} />}
    {page.kind === 'lesson' && category && lesson && <VideoLessonPage user={user} category={category} lesson={lesson} saved={progress.get(lesson.id)} onBack={() => navigate({ kind: 'category', categoryId: category.id })} onSaved={refresh} onOpenLevel={onOpenLevel} onChallenge={onChallenge} />}
  </section>;
}

function VideoHome({ completedTotal, progress, onOpen, onExit, error }: { completedTotal: number; progress: Map<string, VideoProgressRow>; onOpen: (id: string) => void; onExit: () => void; error: string }) {
  return <div className="video-page">
    <div className="video-heading"><div><span className="eyebrow"><CirclePlay/> Aprende sem limites</span><h1>Videoaulas</h1><p>Aprende com explicações em vídeo e revê os temas ao teu ritmo.</p></div><button className="video-close" onClick={onExit}>Voltar ao Voltz</button></div>
    <div className="video-overview"><strong>{completedTotal}<small>/25</small></strong><span>videoaulas concluídas</span></div>
    {error && <p className="video-alert" role="status">{error}</p>}
    <div className="video-category-list">{videoLessonCategories.map((category, index) => {
      const Icon = icons[index] || CirclePlay; const completed = category.videos.filter((video) => progress.get(video.id)?.completed).length;
      return <button key={category.id} className="video-category-card" onClick={() => onOpen(category.id)} style={{ '--video-accent': category.color } as React.CSSProperties}>
        <span className="video-category-icon"><Icon/></span><span className="video-category-copy"><strong>{category.name}</strong><small>{category.description}</small><em><CirclePlay/> 5 videoaulas</em></span>
        <span className="video-category-progress"><b>{completed}/5 vistas</b><i><span style={{ width: `${completed / 5 * 100}%` }}/></i><u>{completed ? 'Continuar' : 'Ver categoria'} <ChevronRight/></u></span>
      </button>;
    })}</div>
    <div className="video-faisca"><div><Sparkles/><strong>Dica da Faísca</strong><span>Vê as videoaulas ao teu ritmo e usa os níveis relacionados para reforçar os conceitos.</span></div><img src={asset('faisca-mobile.webp')} alt="Faísca, mascote do Voltz"/></div>
  </div>;
}

function VideoCategoryPage({ category, progress, onBack, onOpen, error }: { category: VideoLessonCategory; progress: Map<string, VideoProgressRow>; onBack: () => void; onOpen: (id: string) => void; error: string }) {
  const completed = category.videos.filter((video) => progress.get(video.id)?.completed).length;
  return <div className="video-page"><button className="video-back" onClick={onBack}><ArrowLeft/> Voltar às categorias</button>
    <div className="video-category-hero" style={{ '--video-accent': category.color } as React.CSSProperties}><span className="video-category-icon"><CirclePlay/></span><div><h1>{category.name}</h1><p>{category.description}</p></div><div className="video-category-progress"><b>{completed}/5 vistas</b><i><span style={{ width: `${completed / 5 * 100}%` }}/></i></div></div>
    <p className="video-category-intro">{category.intro}</p>{error && <p className="video-alert">{error}</p>}
    <div className="video-grid">{category.videos.map((video) => <VideoCard key={video.id} video={video} row={progress.get(video.id)} onOpen={() => onOpen(video.id)} />)}</div>
  </div>;
}

function VideoCard({ video, row, onOpen }: { video: VideoLesson; row?: VideoProgressRow; onOpen: () => void }) {
  const state = row?.completed ? 'Concluída' : row && row.watched_seconds > 0 ? 'Em progresso' : 'Por ver';
  return <article className="video-card"><button className="video-cover" onClick={onOpen} aria-label={`Abrir videoaula ${video.title}`}>
    <div className="video-placeholder"><CirclePlay/><span>Thumbnail temporária</span></div><span className="video-play"><Play fill="currentColor"/></span><span className={`video-state ${row?.completed ? 'done' : row?.watched_seconds ? 'current' : ''}`}>{row?.completed && <Check/>}{state}</span>{video.durationLabel && <span className="video-duration">{video.durationLabel}</span>}
  </button><div className="video-card-copy"><h2>{video.title}</h2><small>Níveis {video.levelNumbers[0]} e {video.levelNumbers[1]}{video.levelNumbers[1] === 10 ? ' + revisão geral' : ''}</small><p>{video.description}</p></div></article>;
}

function VideoLessonPage({ user, category, lesson, saved, onBack, onSaved, onOpenLevel, onChallenge }: { user: User; category: VideoLessonCategory; lesson: VideoLesson; saved?: VideoProgressRow; onBack: () => void; onSaved: () => Promise<void>; onOpenLevel: (id: string) => void; onChallenge: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null); const lastSaved = useRef(saved?.watched_seconds || 0);
  const [unavailable, setUnavailable] = useState(false); const [saveError, setSaveError] = useState(''); const [duration, setDuration] = useState(saved?.duration_seconds || 0);
  const persist = async (forceComplete = false) => { const video = videoRef.current; if (!video || !Number.isFinite(video.currentTime)) return; const d = Number.isFinite(video.duration) ? video.duration : duration; const watched = video.currentTime; const percent = d > 0 ? Math.min(100, watched / d * 100) : 0; const completed = forceComplete || saved?.completed || percent >= 90; try { await saveVideoProgress(user.id, { video_id: lesson.id, watched_seconds: watched, duration_seconds: d || 0, progress_percent: completed ? 100 : percent, completed, last_watched_at: new Date().toISOString() }); lastSaved.current = watched; setSaveError(''); void onSaved(); } catch { setSaveError('Progresso não guardado. Vamos tentar novamente quando continuares.'); } };
  useEffect(() => { const handler = () => { void persist(); }; window.addEventListener('pagehide', handler); return () => window.removeEventListener('pagehide', handler); }, [lesson.id, duration]);
  return <div className="video-page lesson-video-page"><button className="video-back" onClick={onBack}><ArrowLeft/> Voltar à categoria</button>
    <div className="video-player-wrap">{!unavailable ? <><video ref={videoRef} src={asset(lesson.videoSrc)} controls preload="metadata" controlsList="nodownload" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} onLoadedMetadata={(event) => { const video = event.currentTarget; setDuration(video.duration); if (saved?.watched_seconds && saved.watched_seconds < video.duration - 3) video.currentTime = saved.watched_seconds; }} onTimeUpdate={(event) => { const video = event.currentTarget; if (video.currentTime - lastSaved.current >= 15) void persist(); if (video.duration && video.currentTime / video.duration >= .9 && !saved?.completed) void persist(true); }} onPause={() => void persist()} onEnded={() => void persist(true)} onError={() => setUnavailable(true)} aria-label={lesson.title}/><span className="video-watermark">Voltz</span></> : <div className="video-unavailable"><CirclePlay/><strong>Esta videoaula ainda está a ser preparada.</strong><span>O ficheiro de vídeo ainda não está disponível no projeto.</span></div>}</div>
    {saveError && <p className="video-alert" role="alert">{saveError}</p>}
    <div className="video-lesson-title"><h1>{lesson.title}</h1><div><span><GraduationCap/> {category.name}</span><span><BookOpen/> Níveis {lesson.levelNumbers[0]} e {lesson.levelNumbers[1]}</span>{duration > 0 && <span><Clock3/> {Math.max(1, Math.round(duration / 60))} min</span>}</div><p>{lesson.description}</p></div>
    <section className="video-learn-card"><h2>O que vais aprender</h2>{lesson.learningPoints.map((point) => <p key={point}><Check/> {point}</p>)}</section>
    <div className="video-actions"><button onClick={() => onOpenLevel(lesson.levelIds[0])}><BookOpen/> Ir para o nível {lesson.levelNumbers[0]}</button><button onClick={() => onOpenLevel(lesson.levelIds[1])}><BookOpen/> Ir para o nível {lesson.levelNumbers[1]}</button><button className="primary" onClick={() => onChallenge(lesson.levelIds[1])}><Trophy/> Fazer desafio</button></div>
  </div>;
}