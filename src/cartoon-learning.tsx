import { useState } from 'react';
import './cartoon-art.css';

const art = (name: string) => `${import.meta.env.BASE_URL}cartoon-art/${name}.webp`;
const pilot = (name: string) => `${import.meta.env.BASE_URL}cartoon-pilot/${name}.webp`;

function Cable({ d }: { d: string }) {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke="#142d4d" strokeWidth="12"/>
    <path d={d} stroke="#ffcf27" strokeWidth="7"/>
    <path d={d} stroke="#fff0a1" strokeWidth="2"/>
  </g>;
}

/** The image terminals and wire endpoints share the same SVG coordinates. */
export function CartoonResistance({ voltage = 12, resistance = 6, showCurrent = true }: {
  voltage?: number; resistance?: number; showCurrent?: boolean;
}) {
  return <figure className="cartoon-art cartoon-network">
    <svg viewBox="0 0 440 410" role="img" aria-label={`Fonte de ${voltage} volts ligada numa malha fechada a uma resistência de ${resistance} ohm`}>
      <Cable d="M144 127 H60 V363 H211 M296 127 H380 V363 H269"/>
      <image href={pilot('resistencia')} x="130" y="35" width="180" height="180"/>
      <image href={art('fonte')} x="160" y="250" width="160" height="160"/>
      <text x="220" y="36" textAnchor="middle">R = {resistance} Ω</text>
      <text x="240" y="322" textAnchor="middle" className="cartoon-screen-text">{voltage} V</text>
      <text x="220" y="224" textAnchor="middle">I = {showCurrent ? `${(voltage / resistance).toFixed(1)} A` : '?'}</text>
      <path d="M60 255 V220 m-8 12 8-12 8 12" fill="none" stroke="#1268f4" strokeWidth="4"/>
    </svg>
    <figcaption>U = R × I · Uma carga resistiva ideal, um percurso fechado.</figcaption>
  </figure>;
}

export function CartoonLampCircuit({ initiallyOpen = false, readOnly = false }: { initiallyOpen?: boolean; readOnly?: boolean }) {
  const [closed, setClosed] = useState(!initiallyOpen);
  return <figure className="cartoon-art cartoon-network">
    <svg viewBox="0 0 460 420" role="img" aria-label={`Circuito com bateria, interruptor ${closed ? 'fechado' : 'aberto'} e lâmpada ${closed ? 'acesa' : 'apagada'}`}>
      <Cable d="M197 311 H50 V142 H78 M192 142 H230 V110 H292 M378 110 H420 V311 H254"/>
      <image href={pilot(closed ? 'interruptor-fechado' : 'interruptor')} x="75" y="55" width="120" height="120"/>
      <image href={art(closed ? 'lampada' : 'lampada-apagada')} x="260" y="20" width="150" height="150"/>
      <image href={pilot('bateria')} x="170" y="300" width="110" height="110"/>
      <text x="135" y="204" textAnchor="middle">{closed ? 'Fechado' : 'Aberto'}</text>
      <text x="335" y="204" textAnchor="middle">Lâmpada</text>
      <text x="220" y="282" textAnchor="middle">Bateria</text>
    </svg>
    {!readOnly && <button type="button" aria-pressed={closed} onClick={() => setClosed(!closed)}>{closed ? 'Abrir interruptor' : 'Fechar interruptor'}</button>}
    <figcaption>{closed ? 'O percurso está fechado: a corrente pode circular.' : 'O interruptor aberto interrompe o percurso.'}</figcaption>
  </figure>;
}

export function CartoonMeter({ mode, setMode }: { mode: 'V' | 'A' | 'Ω'; setMode: (mode: 'V' | 'A' | 'Ω') => void }) {
  const angle = mode === 'V' ? 0 : mode === 'A' ? -55 : 55;
  return <div className="cartoon-meter-object">
    <svg viewBox="0 0 640 960" role="img" aria-label={`Multímetro selecionado para ${mode}`}>
      <image href={pilot('multimetro')} width="640" height="960"/>
      <text x="320" y="255" textAnchor="middle" fill="#142d4d" fontSize="64" fontWeight="800">{mode === 'V' ? '12.0' : mode === 'A' ? '2.00' : '6.00'} {mode}</text>
      <circle cx="320" cy="530" r="128" fill="#173b63" stroke="#102a49" strokeWidth="8"/>
      <circle cx="320" cy="530" r="114" fill="#214f7c" stroke="#4d85ad" strokeWidth="4"/>
      <g transform={`rotate(${angle} 320 530)`}>
        <rect x="295" y="425" width="50" height="206" rx="22" fill="#ffd21f" stroke="#142d4d" strokeWidth="6"/>
        <path d="M320 430 l-12 22 h24 Z" fill="#142d4d"/>
      </g>
    </svg>
    <div className="cartoon-meter-hotspots" role="group" aria-label="Rodar seletor do multímetro">
      {(['A', 'V', 'Ω'] as const).map(value => <button key={value} type="button" className={`meter-select-${value === 'Ω' ? 'ohm' : value}`} aria-label={`Selecionar ${value}`} aria-pressed={mode === value} onClick={() => setMode(value)}>{value}</button>)}
    </div>
  </div>;
}

export function CartoonOhm() {
  return <div className="cartoon-ohm"><CartoonResistance/><div className="cartoon-formulas"><strong>U = R × I</strong><strong>I = U ÷ R</strong><strong>R = U ÷ I</strong></div></div>;
}

export function CartoonLighting() {
  const [closed, setClosed] = useState(true);
  return <figure className="cartoon-art cartoon-network">
    <svg viewBox="0 0 520 350" role="img" aria-label={`Iluminação: fase protegida, interruptor ${closed ? 'fechado' : 'aberto'}, lâmpada e retorno pelo neutro`}>
      <image href={art('quadro')} x="5" y="100" width="150" height="180"/>
      <Cable d="M145 145 H170 V102 H198 M312 102 H350 V120 H392 M478 120 H500 V275 H145"/>
      <image href={pilot(closed ? 'interruptor-fechado' : 'interruptor')} x="195" y="15" width="120" height="120"/>
      <image href={art(closed ? 'lampada' : 'lampada-apagada')} x="360" y="30" width="150" height="150"/>
      <text x="160" y="132">L</text><text x="160" y="301">N</text>
      <text x="80" y="310" textAnchor="middle">Quadro / proteção</text>
      <text x="255" y="166" textAnchor="middle">Interruptor</text>
      <text x="435" y="215" textAnchor="middle">Lâmpada</text>
    </svg>
    <button type="button" aria-pressed={closed} onClick={() => setClosed(!closed)}>{closed ? 'Abrir interruptor' : 'Fechar interruptor'}</button>
    <figcaption>L → proteção → interruptor → lâmpada → N. Esquema funcional simplificado; não representa a cablagem interna do quadro.</figcaption>
  </figure>;
}
