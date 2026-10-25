import { ArrowLeft, ArrowUpRight, BookOpen, CircleHelp, CreditCard, Mail, ShieldCheck, Zap } from "lucide-react";

const base = import.meta.env.BASE_URL;
const supportEmail = "voltz@midiahost.pt";
const mailto = (subject: string) => `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;

const topics = [
  {
    icon: <BookOpen aria-hidden="true" />,
    title: "Aprendizagem e progresso",
    text: "Se uma aula não abrir ou o progresso não aparecer, indica o nome da aula, o dispositivo e o email da tua conta. Nunca envies a palavra-passe.",
    subject: "Ajuda com aprendizagem ou progresso",
  },
  {
    icon: <CreditCard aria-hidden="true" />,
    title: "Planos e pagamentos",
    text: "Os planos pagos do Voltz ainda estão a ser preparados. Não faças pagamentos através de links recebidos fora do site oficial do Voltz.",
    subject: "Dúvida sobre planos ou pagamentos Voltz",
  },
  {
    icon: <ShieldCheck aria-hidden="true" />,
    title: "Conta e segurança",
    text: "Para questões de acesso, recuperação de conta ou privacidade, escreve-nos a partir do email associado à conta, se possível.",
    subject: "Ajuda com conta ou segurança Voltz",
  },
];

export default function VoltzSupport() {
  return <main className="support-page">
    <header className="support-topbar">
      <a className="support-brand" href={base} aria-label="Voltar ao Voltz">
        <span><Zap fill="currentColor" aria-hidden="true" /></span> Voltz
      </a>
      <a className="support-back" href={base}><ArrowLeft aria-hidden="true" /> Voltar ao Voltz</a>
    </header>

    <section className="support-hero">
      <span className="support-eyebrow"><CircleHelp aria-hidden="true" /> CENTRO DE AJUDA VOLTZ</span>
      <h1>Como podemos ajudar?</h1>
      <p>Encontra respostas rápidas ou contacta a equipa Voltz. Estamos aqui para ajudar na tua aprendizagem.</p>
      <a className="support-primary" href={mailto("Pedido de apoio Voltz")}><Mail aria-hidden="true" /> Contactar suporte</a>
      <small>Respondemos através de <strong>{supportEmail}</strong></small>
    </section>

    <section className="support-topics" aria-labelledby="support-topics-title">
      <div className="support-section-heading"><span className="support-eyebrow">APOIO AO UTILIZADOR</span><h2 id="support-topics-title">Escolhe o tema</h2></div>
      <div className="support-topic-grid">{topics.map(topic => <article className="support-topic" key={topic.title}>
        <div className="support-topic-icon">{topic.icon}</div>
        <h3>{topic.title}</h3>
        <p>{topic.text}</p>
        <a href={mailto(topic.subject)}>Pedir ajuda <ArrowUpRight aria-hidden="true" /></a>
      </article>)}</div>
    </section>

    <section className="support-faq" aria-labelledby="support-faq-title">
      <span className="support-eyebrow">RESPOSTAS RÁPIDAS</span>
      <h2 id="support-faq-title">Perguntas frequentes</h2>
      <details><summary>Como recupero o acesso à minha conta?</summary><p>No ecrã de entrada, escolhe “Esqueci-me da palavra-passe” e segue a ligação recebida por email. Se não resultar, contacta o suporte.</p></details>
      <details><summary>O Voltz cobra por criar conta ou obter o certificado?</summary><p>A criação de conta e o percurso gratuito não exigem pagamento. O certificado continua sujeito aos requisitos de conclusão apresentados no Voltz.</p></details>
      <details><summary>Os planos Pro já estão disponíveis?</summary><p>A apresentação dos planos está visível, mas as adesões pagas ainda não estão ativas no Voltz. Não introduzas dados de pagamento em páginas que não tenhas aberto a partir do site oficial.</p></details>
      <details><summary>O que devo incluir no pedido de ajuda?</summary><p>Descreve o problema, indica o dispositivo e navegador e, se for relevante, o nome da aula. Não envies palavras-passe, códigos de acesso ou dados de cartão.</p></details>
    </section>

    <footer className="support-footer"><span>Voltz · Aprende hoje. Constrói amanhã.</span><div className="support-footer-links"><a href={`${base}privacidade.html`}>Política de Privacidade</a><a href={`${base}termos.html`}>Termos e Condições</a><a href={mailto("Pedido de apoio Voltz")}><Mail aria-hidden="true" /> {supportEmail}</a></div></footer>
  </main>;
}
