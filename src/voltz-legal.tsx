import { ArrowLeft, ArrowUpRight, Mail, ShieldCheck, Zap } from "lucide-react";

const base = import.meta.env.BASE_URL;
const supportEmail = "voltz@midiahost.pt";
const privacyHref = `${base}privacidade.html`;
const termsHref = `${base}termos.html`;
const supportHref = `${base}apoio.html`;
const updated = "25 de outubro de 2026";

function LegalHeader({ page }: { page: "privacy" | "terms" }) {
  return <header className="legal-topbar">
    <a className="legal-brand" href={base} aria-label="Voltar ao Voltz"><span><Zap fill="currentColor" aria-hidden="true" /></span> Voltz</a>
    <nav aria-label="Navegação legal">
      <a aria-current={page === "privacy" ? "page" : undefined} href={privacyHref}>Privacidade</a>
      <a aria-current={page === "terms" ? "page" : undefined} href={termsHref}>Termos e Condições</a>
      <a href={supportHref}>Ajuda</a>
    </nav>
  </header>;
}

function LegalFooter({ page }: { page: "privacy" | "terms" }) {
  return <footer className="legal-footer">
    <span>Voltz · Aprende hoje. Constrói amanhã.</span>
    <div>
      <a aria-current={page === "privacy" ? "page" : undefined} href={privacyHref}>Política de Privacidade</a>
      <a aria-current={page === "terms" ? "page" : undefined} href={termsHref}>Termos e Condições</a>
      <a href={supportHref}>Ajuda e suporte</a>
      <a href={`mailto:${supportEmail}`}><Mail aria-hidden="true" /> {supportEmail}</a>
    </div>
  </footer>;
}

function PrivacyPolicy() {
  return <>
    <div className="legal-title">
      <span className="legal-eyebrow"><ShieldCheck aria-hidden="true" /> TRANSPARÊNCIA E DADOS</span>
      <h1>Política de Privacidade</h1>
      <p>Explica que dados o Voltz utiliza, para quê, e como podes exercer os teus direitos.</p>
      <small>Atualizada em {updated}</small>
    </div>
    <div className="legal-notice" role="note"><strong>Identificação do responsável por completar.</strong> O email de contacto está ativo, mas esta página precisa do nome legal e da morada postal da pessoa ou entidade que opera o Voltz antes de ser considerada informação jurídica completa. Contacto atual: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</div>
    <article className="legal-content">
      <section><h2>1. Quem trata os dados</h2><p>O Voltz — Aprender Eletricidade é um projeto educativo online. O responsável pelo tratamento dos dados deve ser identificado pelo seu nome legal e morada postal nesta secção. Para questões de privacidade, escreve para <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p><p>O Voltz não indica, nesta versão, um encarregado da proteção de dados. Se a lei exigir a sua designação, os respetivos contactos serão publicados aqui.</p></section>
      <section><h2>2. Dados que utilizamos</h2><ul>
        <li><strong>Conta e autenticação:</strong> email, identificador de conta, nome indicado no registo e dados básicos recebidos do Google quando escolhes entrar por esse serviço, como nome e imagem de perfil. As palavras-passe são tratadas pelo serviço de autenticação e não são guardadas pelo Voltz em texto legível.</li>
        <li><strong>Aprendizagem:</strong> níveis concluídos, progresso, XP, sequência de utilização, progresso de videoaulas e respostas/atividade necessárias às funcionalidades pedagógicas e às ferramentas de turma.</li>
        <li><strong>Preferências e comunicações:</strong> opção de receber emails de aprendizagem, estado de atividade necessário para gerir esses envios e registos de emails de certificado.</li>
        <li><strong>Certificados:</strong> nome apresentado, código único, data de conclusão e dados necessários à emissão, envio e validação pública do certificado. A página pública de validação apresenta apenas os dados indicados nessa página.</li>
        <li><strong>Avaliações e pedidos:</strong> classificação voluntária da experiência e mensagens que decides enviar por email ou através de funcionalidades de feedback/report.</li>
        <li><strong>Funcionamento e segurança:</strong> eventos de utilização autenticada, erros técnicos, rota da aplicação e informação técnica limitada para diagnosticar falhas e proteger o serviço. Os tokens são removidos dos registos de erro quando reconhecidos pelo filtro da aplicação.</li>
      </ul></section>
      <section><h2>3. Finalidades e fundamentos</h2><ul>
        <li>Criar e proteger a conta, iniciar sessão e recuperar o acesso, para prestar as funcionalidades que pediste.</li>
        <li>Guardar e sincronizar o percurso, emitir certificados e disponibilizar funções de professor/turma autorizadas, para executar o serviço educativo.</li>
        <li>Enviar emails de aprendizagem apenas quando ativas essa opção; podes retirar a autorização no Perfil ou no link de cancelamento do email.</li>
        <li>Tratar falhas, prevenir abuso e manter segurança e disponibilidade, com base no funcionamento legítimo e seguro da plataforma.</li>
        <li>Responder a pedidos, cumprir obrigações legais aplicáveis e conservar os registos estritamente necessários para esse efeito.</li>
      </ul></section>
      <section><h2>4. Serviços que apoiam o Voltz</h2><p>Para disponibilizar o serviço, o Voltz utiliza fornecedores tecnológicos, incluindo Supabase (autenticação, base de dados e funções de servidor), GitHub Pages (alojamento do site), Google se escolheres autenticação Google, e Resend para o envio de emails. Estes fornecedores tratam dados segundo as suas funções e configurações. As políticas e localizações aplicáveis dependem da configuração efetivamente ativa.</p><p>Os dados de progresso de um aluno podem ser consultados pelo professor apenas no contexto de turmas a que esteja autorizado. O Voltz não disponibiliza ao professor acesso geral às contas.</p></section>
      <section><h2>5. Onde ficam os dados e durante quanto tempo</h2><p>A sessão de autenticação e parte do progresso são mantidos no armazenamento local do navegador para permitir a utilização e sincronização entre dispositivos. O estado temporário de algumas atividades usa armazenamento de sessão. Os dados associados à conta ficam nos serviços do Voltz e dos respetivos fornecedores.</p><p>Conservamos os dados enquanto a conta e as funcionalidades associadas forem necessárias. Pedidos, certificados e registos que tenham de ser guardados por motivos legais, de segurança ou de defesa de direitos podem ser conservados durante o prazo aplicável. O prazo concreto de retenção será definido e publicado quando forem confirmadas as regras operacionais do serviço. Podes pedir o encerramento da conta e a eliminação dos dados através do contacto acima, sem prejuízo de conservação legalmente obrigatória.</p></section>
      <section><h2>6. Cookies e armazenamento no dispositivo</h2><p>O código atual não instala cookies publicitários nem ferramentas de publicidade comportamental. Utiliza armazenamento local e de sessão para manter a sessão, o progresso local e o estado temporário da navegação. O navegador também pode receber registos técnicos do serviço de alojamento. Se forem adicionados cookies não essenciais ou ferramentas de análise, esta política e os controlos de consentimento serão atualizados antes da sua utilização.</p></section>
      <section><h2>7. Direitos e contacto</h2><p>Nos termos da legislação aplicável, podes pedir acesso, retificação, apagamento, limitação, portabilidade ou opor-te a determinados tratamentos, e retirar consentimentos quando o tratamento se baseia neles. Para isso, contacta <a href={`mailto:${supportEmail}?subject=${encodeURIComponent("Pedido de privacidade Voltz")}`}>{supportEmail}</a>. Podemos pedir informação estritamente necessária para confirmar a identidade.</p><p>Também podes apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD). Consulta a <a href="https://www.cnpd.pt/cidadaos/direitos/" target="_blank" rel="noreferrer">informação da CNPD sobre os direitos dos titulares</a>. O tratamento em Portugal é enquadrado pelo RGPD e pela <a href="https://diariodarepublica.pt/dr/detalhe/lei/58-2019-123815982" target="_blank" rel="noreferrer">Lei n.º 58/2019</a>.</p></section>
      <section><h2>8. Segurança e alterações</h2><p>Aplicamos controlos técnicos e organizativos adequados ao serviço, incluindo autenticação, controlo de acesso por função e regras de acesso à base de dados. Nenhum serviço online pode garantir risco zero. Publicaremos nesta página alterações relevantes e a respetiva data de atualização.</p></section>
    </article>
  </>;
}

function TermsOfService() {
  return <>
    <div className="legal-title">
      <span className="legal-eyebrow"><Zap aria-hidden="true" /> REGRAS DE UTILIZAÇÃO</span>
      <h1>Termos e Condições</h1>
      <p>Regras de acesso e utilização do Voltz — Aprender Eletricidade.</p>
      <small>Atualizados em {updated}</small>
    </div>
    <div className="legal-notice" role="note"><strong>Identificação do operador por completar.</strong> Antes de lançar subscrições ou outros pagamentos, esta página deve indicar o nome legal e a morada postal do profissional responsável, além das condições comerciais aplicáveis. Contacto atual: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</div>
    <article className="legal-content">
      <section><h2>1. Sobre o serviço</h2><p>O Voltz é uma plataforma educativa de apoio à aprendizagem de fundamentos de eletricidade. Disponibiliza percurso, manual, exercícios, demonstrações, videoaulas, perfil, ferramentas de turma e certificados, conforme a disponibilidade e o tipo de conta.</p><p>O serviço destina-se a aprendizagem e apoio pedagógico. Os circuitos e laboratórios são demonstrações educativas: não substituem formação prática supervisionada, avaliação de risco, normas aplicáveis nem o trabalho de um profissional qualificado.</p></section>
      <section><h2>2. Conta e utilização responsável</h2><ul>
        <li>Fornece dados corretos e mantém o acesso à tua conta protegido.</li>
        <li>Não partilhes palavras-passe, não acedas a contas de terceiros e não tentes contornar controlos de acesso.</li>
        <li>Não uses o serviço para atacar, interromper, copiar de forma abusiva ou comprometer a plataforma, outros utilizadores ou os seus dados.</li>
        <li>Se usares ferramentas de professor, só podes consultar dados pedagógicos de alunos das turmas a que foste autorizado.</li>
      </ul><p>Se suspeitares de acesso indevido, contacta <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p></section>
      <section><h2>3. Menores e contexto educativo</h2><p>O Voltz pode ser utilizado em contexto educativo. Menores devem usar a plataforma com o conhecimento e, quando necessário, o acompanhamento do respetivo encarregado de educação ou da instituição de ensino. Professores e instituições devem assegurar que a associação dos alunos e a utilização dos seus dados têm a autorização e a base legal necessárias.</p></section>
      <section><h2>4. Aprendizagem, progresso e certificados</h2><p>O progresso registado depende da conta e dos dados sincronizados. O utilizador pode pedir ajuda se detetar uma falha. O certificado só é emitido quando os requisitos indicados no percurso forem cumpridos. É um registo de conclusão do percurso Voltz e não equivale a diploma oficial, certificação profissional, habilitação legal ou acreditação por uma entidade pública.</p></section>
      <section><h2>5. Planos e pagamentos</h2><p>À data desta versão, a criação de conta e o percurso Free não exigem pagamento. Os planos Pro e Escolas são apresentados como informação, mas a adesão e cobrança no Voltz ainda não estão ativas. Não há renovação paga por estes Termos.</p><p>Se forem lançados serviços pagos, serão apresentados previamente o preço final, duração, renovação, cancelamento, meios de pagamento, condições de acesso e informação sobre direitos de consumidor. Nenhum pagamento será devido sem uma ação explícita de compra. Os direitos legais do consumidor não são limitados por esta página.</p></section>
      <section><h2>6. Conteúdos e propriedade intelectual</h2><p>Os conteúdos, ilustrações, textos, marca, código e materiais do Voltz pertencem aos respetivos titulares ou são utilizados com autorização. Podes consultar e usar os materiais para aprendizagem pessoal e atividades pedagógicas autorizadas. Não podes republicar, vender, distribuir ou explorar comercialmente os conteúdos sem autorização, salvo quando a lei o permita.</p><p>Ao enviares uma avaliação ou report, autorizas o Voltz a utilizá-lo para analisar e melhorar o serviço, sem transferir a titularidade dos teus direitos sobre o texto.</p></section>
      <section><h2>7. Disponibilidade e alterações</h2><p>O Voltz pode ser atualizado para corrigir erros, melhorar a segurança ou acrescentar funcionalidades. Procuramos manter o acesso disponível, mas podem ocorrer interrupções por manutenção, falhas de rede ou de fornecedores. Se uma área ficar indisponível, tenta novamente mais tarde ou contacta o suporte.</p><p>Alterações materiais a estes Termos serão publicadas nesta página com nova data. Se uma alteração afetar uma funcionalidade paga no futuro, será comunicada antes de produzir efeitos para os utilizadores abrangidos, sem prejuízo dos direitos legais.</p></section>
      <section><h2>8. Suspensão e encerramento</h2><p>Podemos limitar ou suspender uma conta quando tal seja necessário para proteger o serviço, outros utilizadores ou cumprir a lei, especialmente em caso de abuso ou violação destes Termos. Sempre que possível, explicaremos o motivo e como pedir revisão. Podes deixar de usar o Voltz e solicitar o encerramento da conta através do apoio.</p></section>
      <section><h2>9. Responsabilidade e direitos legais</h2><p>O Voltz não substitui instrução prática supervisionada nem deve ser usado como única fonte para executar trabalhos elétricos reais. Segue sempre as regras de segurança e a legislação aplicável. Nada nestes Termos exclui ou reduz direitos que a lei não permita limitar, incluindo direitos dos consumidores.</p></section>
      <section><h2>10. Lei aplicável e contacto</h2><p>Estes Termos regem-se pela lei portuguesa, sem prejuízo das normas imperativas de proteção do consumidor aplicáveis. Para questões ou reclamações, contacta <a href={`mailto:${supportEmail}?subject=${encodeURIComponent("Questão sobre os Termos Voltz")}`}>{supportEmail}</a> ou consulta a <a href={supportHref}>área de apoio</a>.</p><p>Os meios de resolução alternativa de litígios de consumo aplicáveis e a identificação legal completa do operador serão indicados antes da disponibilização de qualquer serviço pago.</p></section>
    </article>
  </>;
}

export default function VoltzLegal() {
  const isPrivacy = window.location.pathname.endsWith("privacidade.html");
  const page = isPrivacy ? "privacy" : "terms";
  return <main className="legal-page">
    <LegalHeader page={page} />
    <a className="legal-back" href={supportHref}><ArrowLeft aria-hidden="true" /> Voltar à ajuda e suporte</a>
    {isPrivacy ? <PrivacyPolicy /> : <TermsOfService />}
    <LegalFooter page={page} />
    <a className="legal-up" href="#top" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Voltar ao início"><ArrowUpRight aria-hidden="true" /></a>
  </main>;
}
