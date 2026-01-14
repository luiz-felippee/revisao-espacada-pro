import React, { useState } from 'react';
import { BrainCircuit, Clock, Calendar, Trophy, ChevronRight, BookOpen, Layers, CheckCircle2, Zap } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useStudy } from '../../../context/StudyContext';
import { format, isValid } from 'date-fns';
import { cn } from '../../../lib/utils';
import type { Theme, Subtheme } from '../../../types';
import SummaryTimeline from '../../../components/ui/SummaryTimeline';
import { IconRenderer } from '../../../components/ui/IconRenderer';

interface ThemeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme | null;
}

export const ThemeDetailsModal: React.FC<ThemeDetailsModalProps> = ({ isOpen, onClose, theme }) => {
    const { themes } = useStudy();
    const [expandedSubthemeId, setExpandedSubthemeId] = useState<string | null>(null);

    if (!theme) return null;

    // Helper function to format minutes to hours and minutes
    const formatMinutesToHours = (totalMinutes: number): string => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    };

    // Recalculate progress based on subthemes
    const totalSubs = theme.subthemes.length;
    const completedSubs = theme.subthemes.filter((s: Subtheme) => s.status === 'completed').length;
    const progress = totalSubs === 0 ? 0 : (completedSubs / totalSubs) * 100;
    const isCompleted = progress === 100;

    const themeColor = theme.color || '#3b82f6';

    const colorScheme = isCompleted
        ? {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            gradient: 'from-emerald-600 to-emerald-400'
        }
        : {
            text: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            gradient: 'from-blue-600 to-purple-600' // Using safe default instead of template
        };

    const getNextReviewDate = (sub: Subtheme) => {
        const pending = sub.reviews.find(r => r.status === 'pending');
        return pending?.date;
    };

    const totalMinutes = theme.subthemes.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="3xl">
            <div className="relative overflow-hidden p-6 sm:p-8">
                {/* Background Decoration */}
                <div
                    className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-10"
                    style={{ backgroundColor: themeColor }}
                />
                <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-8">
                    {/* Header: Icon, Title, Category */}
                    <div className="flex items-start gap-6">
                        <div
                            className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border-2 relative overflow-hidden",
                                "bg-gradient-to-br"
                            )}
                            style={{
                                background: isCompleted ? undefined : `linear-gradient(to bottom right, var(--theme-color, ${themeColor}), #6366f1)`,
                                borderColor: isCompleted ? undefined : `var(--theme-color-50, ${themeColor}50)`,
                                ['--theme-color' as any]: themeColor,
                                ['--theme-color-50' as any]: `${themeColor}50`
                            }}
                        >

                            {theme.imageUrl ? (
                                <img src={theme.imageUrl} alt={theme.title} className="w-full h-full object-cover relative z-10" />
                            ) : (
                                <IconRenderer icon={theme.icon} size={40} className="text-white drop-shadow-lg relative z-10" fallback={<BrainCircuit className="w-10 h-10" />} />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    theme.category === 'project' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {theme.category === 'project' ? 'PROJETO' : 'TEMA DE ESTUDO'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-800/50">
                                    {totalSubs} {totalSubs === 1 ? 'MÓDULO' : 'MÓDULOS'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight break-words">
                                {theme.title}
                            </h2>
                        </div>
                    </div>

                    {/* Progress Bar Display */}
                    <div className="bg-slate-900/20 rounded-3xl p-6 shadow-inner">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Trophy className="w-3 h-3" /> Conclusão dos Módulos
                                </span>
                                <div className="text-4xl font-black text-white">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-2">
                                    Estado Geral
                                </span>
                                <div className={cn(
                                    "text-sm font-bold",
                                    isCompleted ? "text-emerald-400" : "text-blue-400"
                                )}>
                                    {isCompleted ? 'Especialista' : 'Em Aprendizado'}
                                </div>
                            </div>
                        </div>
                        <div className="h-4 bg-slate-950/80 rounded-full p-1 border border-slate-800/50 shadow-inner">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                )}
                                style={{
                                    width: `${progress}%`,
                                    background: isCompleted ? '#10b981' : `linear-gradient(to right, var(--theme-color, ${themeColor}), #a855f7)`,
                                    ['--theme-color' as any]: themeColor
                                }}
                            >

                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Criado em</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                {format(new Date(theme.createdAt), 'dd/MM/yy')}
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Módulos Concluídos</span>
                            <div className="text-white font-bold flex items-center gap-2 text-xl">
                                <BookOpen className="w-5 h-5 text-emerald-400" />
                                {completedSubs}<span className="text-slate-500 text-sm">/{totalSubs}</span>
                            </div>
                        </div>
                        <div className="bg-slate-900/20 rounded-2xl p-4 block sm:hidden md:block">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Esforço Estimado</span>
                            <div className="text-white font-bold flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-400" />
                                {totalMinutes} min <span className="text-slate-400 font-normal">({formatMinutesToHours(totalMinutes)})</span>
                            </div>
                        </div>
                    </div>

                    {/* List of Modules Summary */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <Layers className="w-4 h-4" /> Resumo dos Módulos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {theme.subthemes.map((sub, idx) => {
                                const nextDate = getNextReviewDate(sub);
                                const isExpanded = expandedSubthemeId === sub.id;

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => setExpandedSubthemeId(isExpanded ? null : sub.id)}
                                        className={cn(
                                            "rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                                            sub.status === 'completed'
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : isExpanded
                                                    ? "bg-slate-800/40 border-slate-700 ring-1 ring-slate-600"
                                                    : "bg-slate-900/20 border-transparent hover:border-slate-800"
                                        )}
                                    >
                                        <div className="p-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                                                    sub.status === 'completed' ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold truncate transition-colors",
                                                    sub.status === 'completed' ? "text-slate-400 line-through" : isExpanded ? "text-white" : "text-slate-200"
                                                )}>
                                                    {sub.title}
                                                </span>
                                            </div>
                                            {sub.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                        </div>

                                        {/* Expanded Details */}
                                        <div className={cn(
                                            "grid transition-[grid-template-rows] duration-300 ease-out",
                                            isExpanded ? "grid-rows-[1fr] border-t border-slate-800/50" : "grid-rows-[0fr]"
                                        )}>
                                            <div className="overflow-hidden">
                                                <div className="p-3 pt-0 mt-3 space-y-3">
                                                    {/* Dates Info */}
                                                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-400">
                                                        {sub.introductionDate && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3 h-3 text-slate-500" />
                                                                <span>Início: <span className="text-slate-200 font-medium">{format(new Date(sub.introductionDate), 'dd/MM/yy')}</span></span>
                                                            </div>
                                                        )}
                                                        {sub.status === 'queue' && (
                                                            <div className="flex items-center gap-1.5 text-amber-500">
                                                                <Clock className="w-3 h-3" />
                                                                <span>Aguardando na Fila</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* All Reviews List */}
                                                    {sub.reviews && sub.reviews.length > 0 && (
                                                        <div className="bg-slate-950/30 rounded-lg p-2">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Cronograma de Revisões</span>
                                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                                {sub.reviews.map((review, rIdx) => {
                                                                    const isDone = review.status === 'completed';
                                                                    const date = new Date(review.date);
                                                                    const isPast = date < new Date() && !isDone;

                                                                    return (
                                                                        <div key={rIdx} className={cn(
                                                                            "flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-colors",
                                                                            isDone
                                                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                                                : isPast
                                                                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                                                    : "bg-slate-800/40 border-slate-800 text-slate-400"
                                                                        )}>
                                                                            <span className="text-[9px] font-black opacity-60">R{review.number}</span>
                                                                            <span className="text-[10px] font-bold leading-tight">
                                                                                {isValid(date) ? format(date, 'dd/MM') : '--'}
                                                                            </span>
                                                                            {isDone && <CheckCircle2 className="w-2.5 h-2.5 mt-0.5" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Timeline - Box de Resumo/Histórico */}
                    <div className="bg-slate-900/40 rounded-[2rem] overflow-hidden">
                        <div className="p-6 sm:p-8 bg-slate-950/40">
                            <SummaryTimeline
                                summaries={theme.summaries || []}
                                title="Histórico do Tema"
                                maxItems={5}
                                showEmptyState={true}
                            />
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]"
                    >
                        Fechar Detalhes
                    </button>
                </div>
            </div>
        </Modal>
    );
};
