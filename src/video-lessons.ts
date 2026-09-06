import { categories, type Category, type CourseLevel } from './curriculum';

export type VideoLesson = {
  id: string;
  categoryId: string;
  title: string;
  levelIds: [string, string];
  levelNumbers: [number, number];
  description: string;
  thumbnail?: string;
  videoSrc: string;
  captionsSrc?: string;
  durationLabel?: string;
  learningPoints: string[];
  presenter_name?: string;
  presenter_role?: string;
  presenter_school?: string;
};

export type VideoLessonCategory = {
  id: string;
  name: string;
  description: string;
  intro: string;
  color: string;
  videos: VideoLesson[];
};

const categoryDescriptions: Record<string, string> = {
  aprendiz: 'Fundamentos da eletricidade',
  ajudante: 'Materiais e ferramentas',
  instalador: 'Circuitos e montagem',
  tecnico: 'Proteções e quadros',
  especialista: 'Medição e diagnóstico',
};

const aprendizOverrides: Array<Pick<VideoLesson, 'title' | 'description' | 'learningPoints'>> = [
  {
    title: 'Grandezas elétricas + Lei de Ohm',
    description: 'Descobre o que são tensão, corrente e resistência e aprende como se relacionam através da Lei de Ohm.',
    learningPoints: [
      'Identificar tensão, corrente e resistência e as respetivas unidades.',
      'Aplicar a Lei de Ohm em exemplos práticos.',
      'Relacionar as três grandezas num circuito simples.',
    ],
  },
  {
    title: 'Potência e energia + CA/CC',
    description: 'Aprende a distinguir potência e energia e a reconhecer corrente alternada e corrente contínua.',
    learningPoints: [
      'Distinguir potência instantânea de energia consumida.',
      'Reconhecer corrente alternada e corrente contínua.',
      'Associar exemplos do dia a dia a CA e CC.',
    ],
  },
  {
    title: 'Circuito fechado + Série e paralelo',
    description: 'Compreende como funciona um circuito fechado e compara ligações em série e em paralelo.',
    learningPoints: [
      'Reconhecer os elementos essenciais de um circuito fechado.',
      'Comparar ligações em série e em paralelo.',
      'Explicar por que motivo as cargas domésticas funcionam sobretudo em paralelo.',
    ],
  },
  {
    title: 'Fase, neutro e proteção + Frequência e valor eficaz',
    description: 'Identifica L, N e PE e compreende o significado de frequência e valor eficaz.',
    learningPoints: [
      'Distinguir fase, neutro e condutor de proteção pela função.',
      'Interpretar 230 V e 50 Hz.',
      'Compreender o significado de valor eficaz em corrente alternada.',
    ],
  },
  {
    title: 'Símbolos elétricos + Projeto de fundamentos',
    description: 'Reconhece símbolos elétricos essenciais, aplica os conceitos num projeto e revê toda a categoria Aprendiz.',
    learningPoints: [
      'Reconhecer símbolos elétricos essenciais.',
      'Aplicar os fundamentos num pequeno projeto.',
      'Rever os conceitos principais da categoria Aprendiz.',
    ],
  },
];

const tidy = (text: string) => text.trim().replace(/\s+/g, ' ');
const pairDescription = (a: CourseLevel, b: CourseLevel, isReview: boolean) =>
  tidy(`${a.objective} ${b.objective}${isReview ? ' Revê os conceitos essenciais da categoria e relaciona-os num exercício final.' : ''}`);

function makeVideos(category: Category): VideoLesson[] {
  const videos: VideoLesson[] = [];
  for (let index = 0; index < 5; index += 1) {
    const first = category.levels[index * 2];
    const second = category.levels[index * 2 + 1];
    const isReview = index === 4;
    const override = category.id === 'aprendiz' ? aprendizOverrides[index] : undefined;
    videos.push({
      id: `${category.id}-${String(index + 1).padStart(2, '0')}`,
      categoryId: category.id,
      title: override?.title ?? `${first.title} + ${second.title}`,
      levelIds: [first.id, second.id],
      levelNumbers: [index * 2 + 1, index * 2 + 2],
      description: override?.description ?? pairDescription(first, second, isReview),
      videoSrc: `videoaulas/${category.id}/${String(index + 1).padStart(2, '0')}.mp4`,
      learningPoints: override?.learningPoints ?? [
        first.objective,
        second.objective,
        ...(isReview ? [`Rever e consolidar os conteúdos essenciais de ${category.name}.`] : []),
      ],
    });
  }
  return videos;
}

export const videoLessonCategories: VideoLessonCategory[] = categories.map((category) => ({
  id: category.id,
  name: category.name,
  description: categoryDescriptions[category.id] ?? category.role,
  intro: `Nesta categoria vais aprender ${category.levels
    .slice(0, 4)
    .map((level) => level.title.toLocaleLowerCase('pt-PT'))
    .join(', ')} e outros conceitos essenciais, com exemplos práticos e explicações simples e claras.`,
  color: category.color,
  videos: makeVideos(category),
}));

export const videoLessons = videoLessonCategories.flatMap((category) => category.videos);
export const findVideoCategory = (id: string) => videoLessonCategories.find((category) => category.id === id);
export const findVideoLesson = (id: string) => videoLessons.find((video) => video.id === id);
