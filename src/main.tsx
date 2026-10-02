import React from "react";
import ReactDOM from "react-dom/client";
import AuthApp from "./supabase-auth";
import QuestionReportBridge from "./question-report";
import { PublicCertificateValidation } from "./certificate-system";
import { reportTelemetry, startTelemetry } from "./telemetry";
import { installLearningTelemetry } from "./learning-telemetry";
import { initializeAuth } from "./auth-session";
import "./globals.css";

class AppErrorBoundary extends React.Component<{children:React.ReactNode},{error:Error|null}>{
 state:{error:Error|null}={error:null};
 static getDerivedStateFromError(error:Error){return {error}}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error("Voltz runtime error",error,info);reportTelemetry("frontend",error.message,location.pathname+location.search,`${error.stack||""}\n${info.componentStack||""}`)}
 render(){if(this.state.error)return <main className="auth-page"><section className="auth-panel"><span className="eyebrow">Voltz</span><h2>Não foi possível abrir esta área.</h2><p>Ocorreu um erro inesperado. A tua sessão e o teu progresso não foram apagados.</p><button className="primary-button auth-submit" onClick={()=>{history.replaceState({},"",location.pathname);location.reload()}}>Voltar ao Voltz</button></section></main>;return this.props.children}
}

async function start(){await initializeAuth();startTelemetry();installLearningTelemetry();const publicCode=new URLSearchParams(location.search).get("certificado");ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><AppErrorBoundary>{publicCode?<PublicCertificateValidation code={publicCode}/>:<><AuthApp/><QuestionReportBridge/></>}</AppErrorBoundary></React.StrictMode>)}
void start();
