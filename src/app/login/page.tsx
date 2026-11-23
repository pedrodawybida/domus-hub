"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
      });
      if (response.ok) {
        window.location.replace("/");
        return;
      }
      setError(response.status === 401 ? "Usuário ou senha inválidos, ou conta desativada." : "Login indisponível. Tente novamente.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    }
    setPending(false);
  }

  return (
    <main className={styles.page}>
      <aside className={styles.brand} aria-label="Domus Hub">
        <img className={styles.logo} src="/brand/domus-white.svg" alt="Domus" />
        <div className={styles.coverTitle}>Domus<br />Hub</div>
        <img className={styles.art} src="/brand/opera-curitiba.png" alt="" />
        <div className={styles.caption}>Ópera de Arame <span>Curitiba, PR</span></div>
      </aside>
      <section className={styles.content} aria-labelledby="login-title">
        <form onSubmit={handleLogin} className={styles.form}>
          <h1 id="login-title">Acesse sua conta</h1>
          <p>Use suas credenciais do CRM Domus.</p>
          <label>
            Usuário
            <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          </label>
          <label htmlFor="hub-password">Senha</label>
          <div className={styles.password}>
            <input id="hub-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required />
            <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}<ArrowRight size={17} aria-hidden="true" /></button>
        </form>
      </section>
    </main>
  );
}
