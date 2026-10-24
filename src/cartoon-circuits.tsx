import { useId, useState } from 'react';
import { lampStates, type CircuitKind } from './cartoon-circuit-state';
import './cartoon-circuits.css';

export function CartoonCircuit({ kind, initiallyOpen = false, readOnly = false }: { kind: CircuitKind; initiallyOpen?: boolean; readOnly?: boolean }) {
  const [connected, setConnected] = useState<[boolean, boolean]>([!initiallyOpen, true]);
  const lit = readOnly ? [false, false] : lampStates(kind, connected);
  const id = useId().replace(/:/g, '');
  const parallel = kind === 'parallel';
  const toggle = (index: number) => setConnected(previous => {
    const next: [boolean, boolean] = [...previous];
    next[index] = !next[index];
    return next;
  });
  const wire = (d: string, powered: boolean) => <g aria-hidden="true">
    <path d={d} fill="none" stroke="#142d4d" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={powered ? '#f9c927' : '#a6b7ca'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={powered ? '#ffe986' : '#d3dce6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </g>;
  const lamp = (index: number, x: number, y: number) => <g transform={`translate(${x} ${y})`}>
    {lit[index] && <ellipse cy="18" rx="53" ry="55" fill={`url(#${id}-glow)`} />}
    <g className="cartoon-lamp" role={readOnly ? undefined : "button"} tabIndex={readOnly ? undefined : 0}
      aria-label={`${connected[index] ? 'Desligar' : 'Ligar'} lâmpada ${index + 1} em ${parallel ? 'paralelo' : 'série'}`}
      aria-pressed={connected[index]}
      onClick={readOnly ? undefined : () => toggle(index)} onKeyDown={event => {
        if (readOnly) return;
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(index); }
      }}>
      <rect className="lamp-focus" x="-52" y="-32" width="104" height="111" rx="20" fill="transparent" />
      <g transform={connected[index] ? undefined : 'translate(0 -12)'}>
        <path d="M-16 38 C-16 24 -33 18 -33 -2 A33 33 0 0 1 33 -2 C33 18 16 24 16 38 Z"
          fill={`url(#${id}-${lit[index] ? 'glass-on' : 'glass-off'})`} stroke="#142d4d" strokeWidth="4" />
        <path d="M-20 -11 Q-25 -23 -9 -27" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".85" />
        <path d={connected[index] ? 'M-9 38 L-12 8 L-5 14 L0 8 L5 14 L12 8 L9 38' : 'M-9 38 L-12 8 L-5 14 M5 14 L12 8 L9 38'} fill="none" stroke={lit[index] ? '#d2780c' : '#50627a'} strokeWidth="3" strokeLinejoin="round" />
        <rect x="-17" y="35" width="34" height="15" rx="4" fill="#c4d3e0" stroke="#142d4d" strokeWidth="3" />
        <path d="M-13 40 H13 M-13 45 H13" stroke="#617b98" strokeWidth="2" />
      </g>
      <rect x="-44" y="54" width="88" height="14" rx="6" fill="#d5e2ed" stroke="#142d4d" strokeWidth="3" />
      <rect x="-31" y="46" width="62" height="31" rx="10" fill={`url(#${id}-blue)`} stroke="#142d4d" strokeWidth="4" />
      <ellipse cy="47" rx="19" ry="5" fill={connected[index] ? '#ffcf23' : '#142d4d'} stroke="#142d4d" strokeWidth="2" />
      <path d="M-22 55 H-12" stroke="#68caff" strokeWidth="3" strokeLinecap="round" />
    </g>
    <text y="99" textAnchor="middle" className="cartoon-label">L{index + 1}{!connected[index] ? ' · aberta' : readOnly ? '' : lit[index] ? ' · acesa' : ' · apagada'}</text>
  </g>;
  const batteryY = parallel ? 300 : 230;
  return <section className="cartoon-circuit-card" aria-label={`Circuito em ${parallel ? 'paralelo' : 'série'}`}>
    <header><h3>{parallel ? 'Paralelo' : 'Série'}</h3><span>{parallel ? 'Dois ramos' : 'Um percurso'}</span></header>
    <svg className="cartoon-circuit-svg" viewBox={`0 0 480 ${parallel ? 420 : 350}`} aria-label={`Bateria ligada por cabos a duas lâmpadas em ${parallel ? 'paralelo' : 'série'}`}>
      <defs>
        <linearGradient id={`${id}-glass-on`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffbd0"/><stop offset=".55" stopColor="#ffdd27"/><stop offset="1" stopColor="#ffaf08"/></linearGradient>
        <linearGradient id={`${id}-glass-off`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f1f7ff"/><stop offset="1" stopColor="#91abc3"/></linearGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#168cff"/><stop offset="1" stopColor="#0752d4"/></linearGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor="#ffdc36" stopOpacity=".4"/><stop offset="1" stopColor="#ffdc36" stopOpacity="0"/></radialGradient>
      </defs>
      {parallel ? <>
        {wire('M212 311 H65 V96 H196', lit[0] || lit[1])}
        {wire('M268 311 H415 V96 H284', lit[0] || lit[1])}
        {wire('M65 231 H196', lit[1])}
        {wire('M284 231 H415', lit[1])}
        {[65, 415].map(x => <circle key={x} cx={x} cy="231" r="8" fill="#f9c927" stroke="#142d4d" strokeWidth="3"/>)}
        {lamp(0, 240, 35)}{lamp(1, 240, 170)}
      </> : <>
        {wire('M212 241 H48 V126 H111', lit[0])}
        {wire('M199 126 H281', lit[0])}
        {wire('M369 126 H432 V241 H268', lit[0])}
        {lamp(0, 155, 65)}{lamp(1, 325, 65)}
      </>}
      <image href={`${import.meta.env.BASE_URL}cartoon-pilot/bateria.webp`} x="185" y={batteryY} width="110" height="110" />
      <text x="247" y={batteryY + 65} textAnchor="middle" fill="white" fontSize="19" fontWeight="900">9 V</text>
    </svg>
    {!readOnly && <div className="cartoon-circuit-controls">
      {connected.map((on, index) => <button key={index} type="button" aria-pressed={on} onClick={() => toggle(index)}>{on ? 'Desligar' : 'Ligar'} L{index + 1}</button>)}
      <button type="button" onClick={() => setConnected([true, true])}>Repor</button>
    </div>}
    {!readOnly && <p className="cartoon-circuit-status" role="status">{parallel
      ? connected.every(Boolean) ? 'Cada lâmpada tem o seu percurso entre os mesmos polos da bateria.' : lit.some(Boolean) ? 'Um ramo está aberto. A outra lâmpada continua acesa.' : 'Os dois ramos estão abertos. Ambas as lâmpadas estão apagadas.'
      : connected.every(Boolean) ? 'O cabo percorre as duas lâmpadas antes de regressar à bateria.' : 'O único percurso está interrompido. Ambas as lâmpadas apagam.'}</p>}
  </section>;
}

export function CartoonCircuitComparison() {
  return <div className="cartoon-circuits">
    <h2>Série e paralelo</h2>
    <p className="cartoon-circuit-intro">Toca numa lâmpada para a desligar. Segue os cabos e observa o que acontece à outra.</p>
    <div className="cartoon-circuit-grid"><CartoonCircuit kind="series"/><CartoonCircuit kind="parallel"/></div>
    <p className="cartoon-circuit-note">Modelo com bateria e lâmpadas ideais. O brilho é ilustrativo; as ligações mostram os percursos completos.</p>
  </div>;
}
