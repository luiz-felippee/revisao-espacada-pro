import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, User, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudy } from '../../context/StudyContext';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalize = async () => {
        setIsSubmitting(true);
        // If name is still generic, set it to something better or just use email part
        if (user?.name === 'User' || !user?.name) {
            const defaultName = user?.email?.split('@')[0] || 'Estudante';
            await updateProfile({ display_name: defaultName });
        }

        // Mark as dismissed in localStorage to avoid re-triggering just because it's empty
        localStorage.setItem('onboarding_dismissed', 'true');

        onClose();
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-600/10 blur-[50px] pointer-events-none" />

                    <div className="p-8 relative z-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Bem-vindo ao Revisão <span className="text-blue-400">PRO</span></h2>
                            <p className="text-slate-400">Sua jornada para a maestria nos estudos começa aqui. Explore sua dashboard e comece a criar suas missões.</p>
                        </div>

                        <button
                            onClick={handleFinalize}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-white text-slate-950 font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Iniciando...' : 'Começar Agora'} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

