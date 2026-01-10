import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';

export const LoginPage = () => {
    const { loginWithEmail, registerWithEmail, enterGuestMode } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [showOfflineOption, setShowOfflineOption] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowOfflineOption(false);

        if (isLogin) {
            const { error } = await loginWithEmail(email, password);
            if (error) {
                if (error.message?.includes('Invalid login credentials')) {
                    setError('E-mail ou senha incorretos.');
                } else if (error.message?.includes('Failed to fetch')) {
                    setError('Sem conexão com a internet.');
                    setShowOfflineOption(true);
                } else {
                    setError('Falha ao entrar: ' + error.message);
                }
            }
        } else {
            if (!name.trim()) return setError('Nome é obrigatório.');
            const { error } = await registerWithEmail(name, email, password);

            if (error) {
                console.error("Erro de registro:", error);
                const msg = error.message?.toLowerCase() || '';

                if (msg.includes('password')) {
                    setError('A senha deve ter pelo menos 6 caracteres.');
                } else if (msg.includes('already registered') || msg.includes('unique constraint')) {
                    setError('Este e-mail já está em uso.');
                } else if (msg.includes('valid email')) {
                    setError('O e-mail informado é inválido.');
                } else if (msg.includes('security purposes') || msg.includes('rate limit')) {
                    setError('Muitas tentativas recentes. Por segurança, aguarde alguns minutos antes de tentar novamente.');
                } else {
                    setError('Erro ao criar conta: ' + (error.message || 'Tente novamente.'));
                }
            } else {
                setRegisterSuccess(true);
            }
        }
    };

    if (registerSuccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Aurora Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative z-10 text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/50">
                        <Mail className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Verifique seu E-mail</h2>
                        <p className="text-slate-400">
                            Enviamos um link de confirmação para <br />
                            <span className="text-blue-400 font-medium">{email}</span>
                        </p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200">
                        Clique no link enviado para ativar sua conta e começar a estudar!
                    </div>

                    <button
                        onClick={() => {
                            setRegisterSuccess(false);
                            setIsLogin(true);
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors border border-slate-700"
                    >
                        Voltar para Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500/30">
            {/* Aurora Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"
                />
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
                />
            </div>

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 relative z-10">
                {/* Visual Side (Left) - Hidden on Mobile */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden md:flex flex-col justify-center relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-900/20 backdrop-blur-3xl rounded-3xl border border-white/10 -z-10" />

                    <div className="p-12 space-y-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                            <span className="text-3xl">⚡</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold text-white leading-tight">
                                Revisão <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    Espaçada PRO.
                                </span>
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                                A plataforma definitiva que combina técnica (SRS), organização e gamificação para turbinar seu aprendizado.
                            </p>
                        </div>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3">
                            {['Repetição Espaçada', 'Gamificação', 'Análises', 'Modo Offline'].map((feat, i) => (
                                <motion.span
                                    key={feat}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="px-4 py-2 rounded-full bg-slate-800/50 border-slate-800/50 text-sm text-blue-200 backdrop-blur-sm"
                                >
                                    {feat}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Form Side (Right) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl" />

                    <div className="relative p-8 md:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
                            </h2>
                            <p className="text-slate-400">
                                {isLogin ? 'Entre para continuar sua ofensiva' : 'Comece sua jornada de aprendizado hoje'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="group relative">
                                            <UserIcon className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                aria-label="Nome completo"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 hover:border-slate-600"
                                                placeholder="Seu nome completo"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group relative">
                                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    aria-label="Endereço de e-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 hover:border-slate-600"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div className="group relative">
                                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    aria-label="Senha"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 hover:border-slate-600"
                                    placeholder="•••••••"
                                    required
                                />
                            </div>

                            {/* Forgot Password Link - Only shown on login */}
                            {isLogin && (
                                <div className="flex justify-end -mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline decoration-2 underline-offset-4 transition-all"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                            )}

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl"
                                    >
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 border border-white/10 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{isLogin ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            </motion.button>

                            {showOfflineOption && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={enterGuestMode}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 rounded-xl transition-all border border-emerald-500/30 flex items-center justify-center gap-2"
                                >
                                    <span>📡 Entrar em Modo Offline</span>
                                </motion.button>
                            )}
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                {isLogin ? 'Ainda não é membro?' : 'Já possui cadastro?'}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                    className="ml-2 text-blue-400 hover:text-blue-300 font-semibold hover:underline decoration-2 underline-offset-4 transition-all"
                                >
                                    {isLogin ? 'Criar conta' : 'Fazer login'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </div>
    );
};
