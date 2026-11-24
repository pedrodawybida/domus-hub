"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/auth";
import { Lock, User, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { DomusLogo } from "@/components/DomusLogo";

export default function LoginPageClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginAction(username, password);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Não foi possível concluir o acesso. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-md p-8 sm:p-10 relative z-10">
        {/* Logo / Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <DomusLogo className="w-16 h-16" iconOnly variant="blue" />
          <h1 className="text-4xl font-black tracking-widest text-slate-800 mt-4 mb-1 font-barlow uppercase">
            DOMUS
          </h1>
          <p className="text-xs font-bold text-brand-teal tracking-widest uppercase font-barlow">
            CRM de Consórcios
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Faça login na sua conta
          </h2>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Usuário */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                Login de Acesso
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Digite seu login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-blue hover:bg-blue-800 text-white font-bold rounded-md transition-colors flex items-center justify-center gap-2 group cursor-pointer disabled:pointer-events-none font-barlow tracking-wider text-sm uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Acessando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-200" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; {new Date().getFullYear()} Domus Consórcios. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
