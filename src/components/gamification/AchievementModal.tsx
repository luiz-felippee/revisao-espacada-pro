import { useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Trophy, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const AchievementModal = () => {
    const { newlyUnlocked, dismissAchievement } = useStudy();

    useEffect(() => {
        if (newlyUnlocked) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.play().catch(() => { });
        }
    }, [newlyUnlocked]);

    if (!newlyUnlocked) return null;

    // Dynamic Icon
    const IconComponent = (Icons as Record<string, any>)[newlyUnlocked.iconName] || Trophy;

    return (
        <AnimatePresence>
            {newlyUnlocked && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -50 }}
                        className="bg-slate-900/90 backdrop-blur-xl border border-yellow-500/50 p-6 rounded-2xl shadow-2xl shadow-yellow-500/20 max-w-sm w-full text-center pointer-events-auto relative overflow-hidden"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none" />

                        <button
                            onClick={dismissAchievement}
                            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex justify-center mb-4 relative">
                            <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full" />
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center relative shadow-inner border-4 border-slate-900">
                                <IconComponent className="w-10 h-10 text-white drop-shadow-md" />
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-1">Conquista Desbloqueada!</h2>
                            <h3 className="text-2xl font-bold text-white mb-2">{newlyUnlocked.title}</h3>
                            <p className="text-slate-400 text-sm mb-6">{newlyUnlocked.description}</p>

                            <button
                                onClick={dismissAchievement}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl transition-colors"
                            >
                                Incrível!
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
