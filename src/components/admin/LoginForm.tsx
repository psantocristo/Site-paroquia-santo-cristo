import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Church, ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos.');
        }
        throw error;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Esta conta não possui autorização administrativa.');
      }

      toast.success('Login realizado com sucesso! Bem-vindo(a).');
      onLoginSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login no painel.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSite = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1a0202] via-[#2a0404] to-[#120101] p-4 sm:p-6 relative overflow-hidden">
      {/* Sacred background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-950/40 rounded-full blur-2xl pointer-events-none" />

      {/* Voltar ao site link at top */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={handleBackToSite}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs sm:text-sm font-medium transition-all backdrop-blur-md border border-white/10 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Site</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#faf7f2] rounded-3xl p-6 sm:p-10 border border-[#c5a059]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#240404] to-[#3a0808] border-2 border-[#c5a059]/60 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Church className="h-8 w-8 text-[#e8c872]" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#240404] mb-1">
              Painel Administrativo
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm font-light">
              Paróquia Senhor Santo Cristo dos Milagres
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px w-8 bg-[#c5a059]/40" />
              <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" />
              <div className="h-px w-8 bg-[#c5a059]/40" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                E-mail Administrativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="h-4 w-4 text-[#c5a059]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-stone-900 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#c5a059] focus:border-[#240404] outline-none text-sm font-medium placeholder:text-stone-400 transition-all shadow-inner"
                  style={{ color: '#1c1917', backgroundColor: '#ffffff' }}
                  placeholder="exemplo@paroquia.com.br"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="h-4 w-4 text-[#c5a059]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-white text-stone-900 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#c5a059] focus:border-[#240404] outline-none text-sm font-medium placeholder:text-stone-400 transition-all shadow-inner"
                  style={{ color: '#1c1917', backgroundColor: '#ffffff' }}
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-b from-[#2e0505] to-[#1a0202] hover:from-[#3e0707] hover:to-[#240404] text-[#e8c872] font-bold rounded-xl shadow-lg border border-[#c5a059]/40 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-50 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#e8c872] border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-500 font-light">
              Acesso exclusivo para sacerdotes e equipe de secretaria paroquial autorizada.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
