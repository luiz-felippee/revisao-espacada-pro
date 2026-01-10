import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: resetError } = await resetPassword(email);

        setLoading(false);

        if (resetError) {
            if (resetError.message?.includes('rate limit')) {
                setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
            } else {
                setError('Erro ao enviar email. Tente novamente.');
            }
        } else {
            setSuccess(true);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Ambient Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="relative p-8">
                        {!success ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-500/30">
                                        <Mail className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Esqueceu sua senha?
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Digite seu email e enviaremos um link para redefinir sua senha
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="group relative">
                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 hover:border-slate-600"
                                            placeholder="seu@email.com"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl"
                                        >
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 border border-white/10 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="relative z-10">
                                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                                        </span>
                                        {!loading && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        )}
                                    </motion.button>

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="w-full text-slate-400 hover:text-slate-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Voltar ao Login
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Success State */}
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-3">
                                        Email Enviado!
                                    </h2>

                                    <p className="text-slate-400 mb-2">
                                        Enviamos um link de recuperação para:
                                    </p>
                                    <p className="text-blue-400 font-semibold mb-6">
                                        {email}
                                    </p>

                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-200 mb-6">
                                        <p className="font-semibold mb-1">📧 Verifique sua caixa de entrada</p>
                                        <p className="text-xs text-slate-400">
                                            O link expira em 1 hora. Se não encontrar o email, verifique a pasta de spam.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors border border-slate-700"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
