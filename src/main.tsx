import React from "react";
import ReactDOM from "react-dom/client";
import AuthApp from "./supabase-auth";
import QuestionReportBridge from "./question-report";
import { reportTelemetry, startTelemetry } from "./telemetry";
import { installLearningTelemetry } from "./learning-telemetry";
import { SUPABASE_KEY, SUPABASE_URL, writeStoredSession } from "./supabase-client";
import "./globals.css";

class AppErrorBoundary extends React.Component<{children:React.ReactNode},{error:Error|null}>{
 state:{error:Error|null}={error:null};
 static getDerivedStateFromError(error:Error){return {error}}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error("Voltz runtime error",error,info);reportTelemetry("frontend",error.message,location.pathname+location.search,`${error.stack||""}\n${info.componentStack||""}`)}
 render(){if(this.state.error)return <main className="auth-page"><section className="auth-panel"><span className="eyebrow">Voltz</span><h2>Não foi possível abrir esta área.</h2><p>Ocorreu um erro inesperado. A tua sessão e o teu progresso não foram apagados.</p><button className="primary-button auth-submit" onClick={()=>{history.replaceState({},"",location.pathname);location.reload()}}>Voltar ao Voltz</button></section></main>;return this.props.children}
}

async function consumeOAuthCallback(){const hash=new URLSearchParams(location.hash.replace(/^#/,""));if(!hash.get("access_token")||hash.get("type")==="recovery")return;const accessToken=hash.get("access_token")!;const refreshToken=hash.get("refresh_token")||"";const expiresIn=Number(hash.get("expires_in")||3600);history.replaceState({},"",location.pathname+location.search);const response=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${accessToken}`}});if(!response.ok)throw new Error("Não foi possível concluir o início de sessão com Google.");const user=await response.json();writeStoredSession({access_token:accessToken,refresh_token:refreshToken,expires_at:Math.floor(Date.now()/1000)+expiresIn,user})}
async function start(){try{await consumeOAuthCallback()}catch(error){console.error("OAuth callback failed",error)}startTelemetry();installLearningTelemetry();ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><AppErrorBoundary><><AuthApp /><QuestionReportBridge/></></AppErrorBoundary></React.StrictMode>)}
void start();
