import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, Shield } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.search).get("denied")
      ? "Acceso restringido: solo administradores."
      : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const user = await base44.auth.me();
      if (user?.role !== "admin") {
        await base44.auth.logout("/login?denied=1");
        return;
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message || "Email o contraseña incorrectos");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/admin");
  };

  const inputCls = "w-full pl-10 pr-3 h-12 text-sm bg-[#15101f] border border-[#3c3158] rounded-lg text-[#efe9dc] placeholder-[#6b6180] focus:outline-none focus:border-[#b8902a] focus:shadow-[0_0_12px_rgba(255,210,74,0.25)] transition-all";

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 bg-[#050308] bg-cover bg-center"
      style={{ backgroundImage: 'url("https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/9b034fe3c_generated_image.png")' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a14cc] via-[#0a0810aa] to-[#050308ee]" />

      <div className="relative w-full max-w-md">
        {/* Marco dorado */}
        <div className="rounded-2xl p-[2px] shadow-[0_0_50px_rgba(192,91,255,0.2),0_20px_60px_rgba(0,0,0,0.8)]" style={{ background: 'linear-gradient(160deg, #ffe49a, #b8902a 30%, #3c3158 55%, #b8902a 80%, #ffe49a)' }}>
          <div className="rounded-2xl px-7 py-9 backdrop-blur-md" style={{ background: 'linear-gradient(180deg, #1a1430f5, #120e1cf8)' }}>

            {/* Emblema */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#b8902a] bg-[#15101f] shadow-[0_0_25px_rgba(255,210,74,0.35)]">
                <Shield className="w-8 h-8 text-[#FFD24A]" />
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-3xl text-center tracking-widest bg-gradient-to-b from-[#ffe9a8] via-[#FFD24A] to-[#c8901f] bg-clip-text text-transparent">
              BIZARRE FANTASIES
            </h1>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#b8902a]" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#c9a9ff] uppercase">Backoffice</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#b8902a]" />
            </div>
            <p className="text-center text-xs text-[#a89fbb] mb-7">Acceso solo para administradores del reino</p>

            <button
              onClick={handleGoogle}
              className="w-full h-12 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg border border-[#3c3158] bg-[#221a36] text-[#efe9dc] hover:border-[#b8902a] hover:bg-[#2a2142] active:scale-[0.98] transition-all"
            >
              <GoogleIcon className="w-5 h-5" />
              Continuar con Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3c3158]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] uppercase tracking-widest text-[#8a8099]" style={{ background: '#161126' }}>o</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm font-semibold text-[#ff9d9d]" style={{ background: '#cc333318', border: '1px solid #cc333355' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold tracking-wider text-[#c9bfe0] uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8099]" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold tracking-wider text-[#c9bfe0] uppercase">Contraseña</label>
                  <Link to="/forgot-password" className="text-xs text-[#c9a9ff] hover:text-[#FFD24A] transition-colors">
                    ¿Olvidaste la contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8099]" aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center rounded-lg font-black text-sm tracking-wider text-[#2a1d05] bg-gradient-to-b from-[#ffe49a] via-[#FFD24A] to-[#d8a431] border border-[#ffe9a8] shadow-[0_4px_18px_rgba(255,210,74,0.35)] hover:shadow-[0_4px_26px_rgba(255,210,74,0.55)] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ENTRANDO...
                  </>
                ) : (
                  "ENTRAR AL BACKOFFICE"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#6b6180] mt-4 tracking-wider">Bizarre Fantasies · Base Set</p>
      </div>
    </div>
  );
}