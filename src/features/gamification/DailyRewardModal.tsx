import React, { useEffect, useState } from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Flame, Gift, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyRewardModal: React.FC = () => {
    const { gamification, claimDailyReward } = useGamification();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!gamification.streak) return; // Wait for load

        const today = new Date().toISOString().split('T')[0];
        const lastLogin = gamification.streak.lastLoginDate;
        const lastRewardDate = gamification.streak.lastDailyRewardDate;

        // Verificar se acessou hoje e ainda não reivindicou
        if (lastLogin === today && lastRewardDate !== today) {
            // Small delay to ensure UI is ready and it's not jarring
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [gamification.streak]);

    const handleClaim = () => {
        const result = claimDailyReward();

        if (result.claimed) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#EF4444', '#10B981']
            });
            setIsOpen(false);
        } else {
            // Já foi reivindicado (não deveria chegar aqui, mas é uma proteção)
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={() => { }} title="" maxWidth="sm">
            <div className="relative p-6 pt-10 pb-8 flex flex-col items-center text-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 ring-4 ring-orange-500/20 rotate-3 animate-bounce-slow">
                        <Flame className="w-10 h-10 text-white fill-white drop-shadow-md" />
                    </div>

                    <div className="space-y-1 mt-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Ofensiva em Chamas!
                        </h2>
                        <p className="text-slate-400 font-medium">
                            Você entrou por <span className="text-orange-400 font-bold text-lg">{gamification.streak.current} dias</span> seguidos.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 w-full mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recompensa Diária</span>
                            <Gift className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                            +50 XP
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleClaim}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 border-none shadow-lg shadow-orange-900/20 group"
                    >
                        <span className="font-bold text-white group-hover:scale-105 transition-transform">Resgatar Recompensa</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
