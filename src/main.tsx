import React from "react";
import ReactDOM from "react-dom/client";
import AuthApp from "./supabase-auth";
import "./globals.css";

class AppErrorBoundary extends React.Component<{children:React.ReactNode},{error:Error|null}>{
  state:{error:Error|null}={error:null};
  static getDerivedStateFromError(error:Error){return {error}}
  componentDidCatch(error:Error,info:React.ErrorInfo){console.error("Voltz runtime error",error,info)}
  render(){if(this.state.error)return <main className="auth-page"><section className="auth-panel"><span className="eyebrow">Voltz</span><h2>Não foi possível abrir esta área.</h2><p>Ocorreu um erro inesperado. A tua sessão e o teu progresso não foram apagados.</p><button className="primary-button auth-submit" onClick={()=>{history.replaceState({},"",location.pathname);location.reload()}}>Voltar a abrir o Voltz</button></section></main>;return this.props.children}
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary><AuthApp /></AppErrorBoundary>
  </React.StrictMode>,
);
