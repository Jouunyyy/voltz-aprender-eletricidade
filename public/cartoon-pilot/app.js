import { questions } from './questions.js';

const $ = (id) => document.getElementById(id);
const topics = ['Leitura', 'Bateria', 'Lei de Ohm', 'Circuito aberto', 'Resistência'];
const answers = Array(5).fill(null);
let current = 0;
let changed = false;

function prop(name, alt, className) {
  const wrap = document.createElement('div');
  wrap.className = `prop ${className}`;
  const image = new Image();
  image.src = `./cartoon-pilot/${name}.webp`;
  image.alt = alt;
  image.width = 640;
  image.height = name === 'multimetro' ? 960 : 640;
  wrap.append(image);
  return wrap;
}

function label(parent, text, className = 'value') {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  parent.append(span);
  return span;
}

function draw() {
  const visual = $('visual');
  visual.replaceChildren();
  if (current === 0) {
    const meter = prop('multimetro', 'Multímetro cartoon com o seletor na posição A', 'meter');
    label(meter, changed ? '6 A' : '3 A', 'lcd');
    visual.append(meter);
    $('visual-note').textContent = 'Observa o valor e o símbolo no visor.';
  } else if (current === 1) {
    const battery = prop('bateria', 'Bateria cartoon com polos positivo e negativo', 'battery');
    label(battery, '9 V');
    visual.append(battery);
    $('visual-note').textContent = 'Lê a marcação na bateria.';
  } else if (current === 2 || current === 4) {
    const pair = document.createElement('div');
    pair.className = 'duo';
    const battery = prop('bateria', 'Fonte ideal de tensão contínua', 'battery');
    const resistor = prop('resistencia', 'Módulo de resistência ajustável', `resistor${changed ? ' changed' : ''}`);
    const resistance = current === 2 ? (changed ? '10 Ω' : '5 Ω') : (changed ? '10 Ω' : '5 Ω → 10 Ω');
    label(battery, current === 2 ? '15 V' : '12 V');
    label(resistor, resistance);
    pair.append(battery, resistor);
    visual.append(pair);
    $('visual-note').textContent = current === 2 ? 'Modelo ideal: a tensão indicada é aplicada à resistência.' : 'A fonte mantém 12 V. Compara os dois valores de resistência.';
  } else {
    const switchProp = prop(changed ? 'interruptor-fechado' : 'interruptor', changed ? 'Interruptor cartoon fechado, contactos unidos' : 'Interruptor cartoon aberto, com separação entre contactos', 'switch');
    visual.append(switchProp);
    label(visual, 'Fonte: 12 V', 'source-chip');
    $('visual-note').textContent = changed ? 'Interruptor fechado: o percurso do modelo fica completo.' : 'Interruptor aberto num circuito simples com fonte e carga.';
    if (answers[current] !== null) {
      switchProp.setAttribute('role', 'button');
      switchProp.tabIndex = 0;
      switchProp.setAttribute('aria-label', changed ? 'Abrir interruptor' : 'Fechar interruptor');
      switchProp.addEventListener('click', toggle);
      switchProp.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
      });
    }
  }
}

function experiment() {
  const section = $('experiment');
  section.replaceChildren();
  section.hidden = answers[current] === null;
  if (section.hidden) return;
  const title = document.createElement('h3');
  title.textContent = 'Agora experimenta';
  section.append(title);
  if (current === 1) {
    const text = document.createElement('p');
    text.textContent = 'Os polos + e − indicam a polaridade. Os 9 V indicam a tensão nominal; a corrente depende da carga ligada.';
    section.append(text);
    return;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = current === 0 ? (changed ? 'Voltar à leitura de 3 A' : 'Mostrar uma leitura de 6 A')
    : current === 3 ? (changed ? 'Abrir interruptor' : 'Fechar interruptor')
    : (changed ? 'Voltar a 5 Ω' : 'Ajustar para 10 Ω');
  button.id = 'toggle-experiment';
  button.addEventListener('click', toggle);
  const output = document.createElement('output');
  output.setAttribute('aria-live', 'polite');
  output.textContent = current === 0 ? `${changed ? 6 : 3} A · a grandeza continua a ser corrente.`
    : current === 2 ? `I = 15 ÷ ${changed ? 10 : 5} = ${changed ? '1,5' : '3'} A`
    : current === 3 ? (changed ? 'Percurso fechado: pode circular corrente na carga.' : 'Percurso aberto: I = 0 A na carga; a fonte mantém 12 V.')
    : `U = 12 V · R = ${changed ? 10 : 5} Ω · I = ${changed ? '1,2' : '2,4'} A`;
  section.append(button, output);
}

function toggle() {
  changed = !changed;
  draw();
  experiment();
  $('toggle-experiment')?.focus({ preventScroll: true });
}

function render(focus = false) {
  const item = questions[current];
  changed = false;
  $('counter').textContent = `Pergunta ${current + 1} de 5`;
  $('topic').textContent = topics[current];
  $('question').textContent = item.q;
  $('steps').replaceChildren();
  questions.forEach((_, index) => {
    const button = document.createElement('button');
    button.textContent = `${index + 1}${answers[index] !== null ? ' ✓' : ''}`;
    button.setAttribute('aria-label', `Pergunta ${index + 1}${answers[index] !== null ? ', respondida' : ''}`);
    if (index === current) button.setAttribute('aria-current', 'step');
    if (answers[index] !== null) button.className = 'done';
    button.addEventListener('click', () => { current = index; render(true); });
    $('steps').append(button);
  });
  $('options').replaceChildren();
  // Rotate the correct answer position without changing the authored answer mapping.
  const order = [[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 0, 2], [2, 1, 0]][current];
  order.forEach((originalIndex, position) => {
    const button = document.createElement('button');
    button.className = 'option';
    label(button, String.fromCharCode(65 + position), 'letter');
    label(button, item.options[originalIndex], 'answer');
    const chosen = answers[current];
    if (chosen !== null) {
      button.disabled = true;
      if (originalIndex === item.answer) { button.classList.add('correct'); label(button, '✓', 'result-mark'); }
      else if (originalIndex === chosen) { button.classList.add('incorrect'); label(button, '×', 'result-mark'); }
    }
    button.addEventListener('click', () => { answers[current] = originalIndex; render(); });
    $('options').append(button);
  });
  const chosen = answers[current];
  const feedback = $('feedback');
  feedback.hidden = chosen === null;
  feedback.replaceChildren();
  feedback.className = chosen === item.answer ? '' : 'incorrect';
  if (chosen !== null) {
    const title = document.createElement('strong');
    title.textContent = chosen === item.answer ? 'Certo!' : 'Vamos perceber.';
    feedback.append(title, document.createTextNode(item.explanation));
  }
  $('previous').disabled = current === 0;
  $('next').textContent = current === 4 ? 'Concluir amostra ✓' : 'Próxima →';
  draw();
  experiment();
  if (focus) $('question').focus({ preventScroll: true });
}

$('previous').addEventListener('click', () => { if (current > 0) { current--; render(true); } });
$('next').addEventListener('click', () => {
  if (current < 4) { current++; render(true); return; }
  const missing = answers.indexOf(null);
  if (missing !== -1) { current = missing; render(true); return; }
  const article = document.querySelector('article');
  article.replaceChildren();
  article.className = 'completion';
  const heading = document.createElement('h2');
  heading.tabIndex = -1;
  heading.textContent = 'Amostra concluída!';
  const text = document.createElement('p');
  text.textContent = 'Viste as cinco primeiras perguntas do nível 1 no novo estilo. Podes voltar a experimentar ou regressar ao Voltz.';
  const button = document.createElement('button');
  button.className = 'primary';
  button.textContent = 'Repetir a amostra';
  button.addEventListener('click', () => location.reload());
  $('steps').hidden = true;
  article.append(heading, text, button);
  heading.focus();
});

render();
