import { BrainCircuit, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Theme, Subtheme } from '../../../types';
import { SubthemeItem } from './SubthemeItem';
import { IconRenderer } from '../../../components/ui/IconRenderer';

interface ThemeCardProps {
    theme: Theme;
    completionDate: string | null;
    queuedSubthemesMap: Map<string, string>;
    onEdit: () => void;
    onDelete: () => void;
    onOpenNotes: (sub: Subtheme) => void;
    onOpenDetails: () => void;
    unlockedSubthemes: string[];
}

export const ThemeCard = ({ theme, completionDate, queuedSubthemesMap, onEdit, onDelete, onOpenNotes, onOpenDetails, unlockedSubthemes }: ThemeCardProps) => {
    const themeColor = theme.color || '#3b82f6';

    // Calculate Progress
    const totalSubs = theme.subthemes.length;
    const completedSubs = theme.subthemes.filter((s: Subtheme) => s.status === 'completed').length;
    const progress = totalSubs === 0 ? 0 : (completedSubs / totalSubs) * 100;

    return (
        <div className="group relative w-full h-full flex flex-col">
            {/* Main Card Structure */}
            <div
                onClick={onOpenDetails}
                className="relative flex-1 bg-[#0f111a] rounded-[2rem] border border-slate-800/50 overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/50 hover:translate-y-[-2px] cursor-pointer"
            >

                {/* Ambient Background Gradient (restored "Design de Antes" feel) */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at top left, ${themeColor}, transparent 70%)`
                    }}
                />

                {/* Header Content (The screenshot part) */}
                <div className="relative p-6 z-10">
                    <div className="flex items-start gap-4">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                            {/* Icon Box */}
                            <div
                                className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center shrink-0 bg-gradient-to-br from-white/5 to-white/0 shadow-lg"
                                style={{ boxShadow: `0 8px 32px -8px ${themeColor}40` }}
                            >
                                {theme.imageUrl ? (
                                    <img
                                        src={theme.imageUrl}
                                        alt={theme.title}
                                        className="w-full h-full object-cover rounded-2xl opacity-90"
                                    />
                                ) : (
                                    <div className="text-white/90 transform group-hover:scale-110 transition-transform duration-500">
                                        <IconRenderer icon={theme.icon} size={32} fallback={<BrainCircuit className="w-8 h-8" />} />
                                    </div>
                                )}
                            </div>

                            {/* Title & Badge */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-white tracking-tight leading-tight mb-2 drop-shadow-sm truncate">
                                    {theme.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest backdrop-blur-sm">
                                        {totalSubs} {totalSubs === 1 ? 'Módulo' : 'Módulos'}
                                    </span>
                                    {/* Category Badge */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${theme.category === 'project'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {theme.category === 'project' ? 'Projeto' : 'Tema'}
                                    </span>
                                    {/* Start Date */}
                                    {theme.startDate && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800/60 text-slate-300 border border-slate-600/40">
                                            Início: {new Date(theme.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                    )}
                                    {/* Deadline */}
                                    {theme.deadline && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800/60 text-slate-300 border border-slate-600/40">
                                            Fim: {new Date(theme.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions - Positioned on the right */}
                        {/* Actions - Positioned on the right */}
                        <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="w-8 h-8 flex items-center justify-center bg-slate-950/40 hover:bg-blue-600/80 backdrop-blur-md rounded-full text-slate-400 hover:text-white transition-all duration-200 border border-white/5 hover:border-blue-400/50 shadow-sm"
                                title="Editar tema"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="w-8 h-8 flex items-center justify-center bg-slate-950/40 hover:bg-red-600/80 backdrop-blur-md rounded-full text-slate-400 hover:text-white transition-all duration-200 border border-white/5 hover:border-red-400/50 shadow-sm"
                                title="Excluir tema"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body Content (Progress + Subthemes) - Kept but styled comfortably below header */}
                <div className="relative px-6 pb-6 space-y-6">

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs px-1">
                            <span className="text-slate-500 font-bold uppercase tracking-wider">Progresso</span>
                            <span className="text-slate-300 font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out relative group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                                style={{ width: `${progress}%`, background: themeColor }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>

                    {/* Subthemes List (Grouped by Modules) */}
                    <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                        {(() => {
                            const groups: { module: Subtheme | null, items: Subtheme[] }[] = [];
                            let currentGroup: { module: Subtheme | null, items: Subtheme[] } | null = null;

                            theme.subthemes.forEach(sub => {
                                if (sub.difficulty === 'module') {
                                    currentGroup = { module: sub, items: [] };
                                    groups.push(currentGroup);
                                } else {
                                    if (!currentGroup) {
                                        currentGroup = { module: null, items: [] };
                                        groups.push(currentGroup);
                                    }
                                    currentGroup.items.push(sub);
                                }
                            });

                            return groups.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-1.5">
                                    {group.module && (
                                        <SubthemeItem
                                            sub={group.module}
                                            themeColor={themeColor}
                                            onOpenNotes={onOpenNotes}
                                            unlockedSubthemes={unlockedSubthemes}
                                        />
                                    )}
                                    <div className={cn("space-y-1.5", group.module && "pl-2 border-l border-slate-800/50 ml-1")}>
                                        {group.items.map(sub => (
                                            <SubthemeItem
                                                key={sub.id}
                                                sub={sub}
                                                themeColor={themeColor}
                                                projectedStart={queuedSubthemesMap.get(sub.id)}
                                                onOpenNotes={onOpenNotes}
                                                unlockedSubthemes={unlockedSubthemes}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                        {theme.subthemes.length === 0 && (
                            <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                <p className="text-slate-500 text-xs">Sem módulos ainda</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
