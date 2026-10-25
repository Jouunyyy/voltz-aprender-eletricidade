import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './voltz-plans.css';

const plans = [
  { name: 'Free', price: '0 €', period: 'Gratuito', tagline: 'Aprende eletricidade gratuitamente.', features: ['Percurso completo: 50 níveis e 5 categorias', 'Explicações essenciais, manual simples e demonstrações do percurso', 'XP, progresso guardado, perfil e avaliação da experiência', 'Certificado após cumprir os requisitos, PDF, código único e QR de validação pública'], excluded: 'Não inclui manual avançado, desafios e banco completos, videoaulas completas ou ferramentas de professores.', action: 'Plano gratuito' },
  { name: 'Pro', price: '3,99 €', period: '/mês · ou 29,99 €/ano', tagline: 'Aprofunda a aprendizagem com toda a experiência Voltz.', features: ['Tudo do Free', 'Manual completo e conteúdos aprofundados', 'Desafios completos: perguntas, feedback, explicações e revisão dos erros', 'Banco completo de perguntas', '25 videoaulas: 5 por categoria', 'Futuras funcionalidades individuais Pro, nas condições do lançamento'], excluded: 'Não inclui gestão de turmas, acompanhamento de alunos nem ferramentas institucionais.', action: 'Adesão disponível em breve' },
  { name: 'Escolas', price: '550 €', period: '/ano por instituição · cerca de 45,83 €/mês', tagline: 'Leva o Voltz para a sala de aula.', features: ['Experiência Pro para alunos associados durante a licença aplicável', 'Professores autorizados: turmas, códigos de entrada e associação de alunos', 'Acompanhamento de progresso, desempenho, atividade e recomendações', 'Estatísticas pedagógicas e análise por matérias', 'Voltz Live em contexto de turma', 'Camada institucional prevista: gestão de professores, estatísticas agregadas, histórico e suporte'], excluded: 'Os professores consultam apenas dados necessários dos alunos das suas turmas. A instituição trabalha sobretudo com informação agregada.', action: 'Adesão disponível em breve' },
];

export default function ProfilePlans() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => { dialog.current?.close(); setOpen(false); trigger.current?.focus(); };
  return <div className="profile-plans">
    <span className="voltz-plan-badge">Voltz Free</span>
    <button ref={trigger} className="voltz-upgrade" onClick={() => { setOpen(true); dialog.current?.showModal(); }}>Atualizar plano</button>
    {createPortal(<dialog ref={dialog} className="voltz-plans-dialog" aria-labelledby="plans-title" onCancel={close} onClose={() => setOpen(false)}>
      {open && <><header className="plans-header"><div><span className="eyebrow">Aprende hoje. Constrói amanhã.</span><h2 id="plans-title">Um plano para cada etapa</h2></div><button autoFocus className="plans-close" onClick={close} aria-label="Fechar planos">✕</button></header><div className="plans-body">
      <p>O Free permite aprender e concluir o percurso. O Pro acrescenta profundidade e prática. Escolas leva essa experiência para a sala de aula.</p>
      <p className="plans-notice">Pro e Escolas disponíveis em breve. Por agora, o teu acesso mantém-se e não é cobrado qualquer pagamento.</p>
      <div className="voltz-plans-grid">{plans.map(plan => <article key={plan.name} className={plan.name === 'Pro' ? 'is-pro' : ''}><h3>Voltz {plan.name}</h3><strong className="plan-price">{plan.price}</strong><span className="plan-period">{plan.period}</span><p>{plan.tagline}</p><ul>{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul><p className="plan-excluded">{plan.excluded}</p><span className="plan-availability">{plan.action}</span></article>)}</div>
      <section><h3>Escolas tester / parceiras de avaliação</h3><p><strong>0 € durante a fase de avaliação acordada.</strong> Para instituições que colaborem na revisão técnica e pedagógica, clareza das explicações, exercícios, progressão e experiência de alunos e professores. Este estatuto não representa certificação ou validação oficial.</p></section>
      <section><h3>O certificado continua acessível no Free</h3><p>O Pro não compra XP, respostas corretas ou certificados, não facilita perguntas nem permite saltar requisitos de conclusão. O certificado depende da aprendizagem e dos requisitos do percurso.</p></section>
      <section><h3>Voltz Live</h3><p>Os limites comerciais de participantes, sessões e histórico ainda estão por definir. O acesso atual mantém-se nesta fase.</p></section>
      <section><h3>Planos e permissões são diferentes</h3><p>O Pro é um plano individual. As ferramentas de professor exigem autorização e associação a uma instituição; a administração do Voltz mantém um acesso separado.</p></section>
      </div></>}
    </dialog>, document.body)}
  </div>;
}
