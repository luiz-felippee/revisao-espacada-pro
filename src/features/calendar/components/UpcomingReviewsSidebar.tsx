import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlayCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

interface UpcomingReviewsSidebarProps {
    upcomingList: {
        id: string;
        number: number;
        date: string;
        themeTitle: string;
        subthemeTitle: string;
        type: 'active' | 'projected';
        status: 'pending' | 'completed';
        originalDate: Date;
        color?: string;
    }[];
    now: Date;
    activeFocus: { id: string } | null;
    onStartFocus: (item: any) => void;
}

export const UpcomingReviewsSidebar: React.FC<UpcomingReviewsSidebarProps> = ({
    upcomingList,
    now,
    activeFocus,
    onStartFocus
}) => {
    return (
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-400" />
                    Cronograma
                </h3>

                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {upcomingList.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">Nenhuma revisão próxima encontrada.</p>
                    ) : (
                        upcomingList.map((item: any, idx: number) => {
                            const isProjected = item.type === 'projected';
                            const todayTime = new Date(now);
                            todayTime.setHours(0, 0, 0, 0);

                            const isTodayItem = item.originalDate.getTime() === todayTime.getTime();
                            const isOverdue = !isProjected && item.originalDate < todayTime;

                            // Dynamic styling based on item color
                            const themeColor = item.color || '#3b82f6';
                            const isBlueDefault = themeColor === '#3b82f6'; // Check if default to avoid overpowering blue if random wasn't used?

                            return (
                                <div
                                    key={`${item.id}-${item.number}-${idx}`}
                                    style={{
                                        borderColor: isProjected ? undefined : `var(--theme-color-40, ${themeColor}40)`,
                                        background: isProjected
                                            ? undefined
                                            : `linear-gradient(to right, var(--theme-color-08, ${themeColor}08), transparent)`,
                                        ['--theme-color-40' as any]: `${themeColor}40`,
                                        ['--theme-color-08' as any]: `${themeColor}08`
                                    }}
                                    className={cn(
                                        "relative p-3 rounded-xl border transition-all group hover:scale-[1.02] overflow-hidden",
                                        isProjected
                                            ? "bg-slate-800/30 border-dashed border-slate-700/50 opacity-70 hover:opacity-100"
                                            : "bg-slate-900/40 hover:bg-slate-900/60 shadow-lg",
                                        // Overrides for Overdue/Today
                                        isOverdue && !isProjected && "ring-1 ring-red-500/50 border-red-500/50 bg-red-950/20",
                                        isTodayItem && !isOverdue && !isProjected && "ring-1 ring-blue-500/50 border-blue-500/50 bg-blue-950/20"
                                    )}
                                >
                                    {/* Accent Bar on Left */}
                                    {!isProjected && (
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1"
                                            style={{ backgroundColor: themeColor }}
                                        />
                                    )}

                                    <div className="flex justify-between items-start mb-1 pl-2">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            isProjected ? "text-slate-500" : "text-slate-300",
                                            isOverdue && "text-red-400 animate-pulse",
                                            isTodayItem && !isOverdue && "text-blue-400"
                                        )}>
                                            {isOverdue ? 'Atrasado' : (isTodayItem ? 'Hoje' : format(item.originalDate, "d 'de' MMM", { locale: ptBR }))}
                                        </span>
                                        <div
                                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 border border-white/5"
                                            style={{ color: isProjected ? undefined : themeColor }}
                                        >
                                            #{item.number}
                                        </div>
                                    </div>

                                    <h4 className={cn(
                                        "font-bold text-sm truncate mb-1 pl-2",
                                        isProjected ? "text-slate-400" : "text-white"
                                    )}>
                                        {item.subthemeTitle}
                                    </h4>

                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pl-2">
                                        <div
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: themeColor }}
                                        />
                                        <span className="truncate">{item.themeTitle}</span>
                                    </div>

                                    {(isTodayItem || isOverdue) && !isProjected && !activeFocus && (
                                        <Button
                                            size="sm"
                                            style={{
                                                backgroundColor: isOverdue ? undefined : themeColor,
                                                borderColor: isOverdue ? undefined : themeColor
                                            }}
                                            className={cn(
                                                "w-full mt-3 h-7 text-xs border-0 text-white shadow-lg",
                                                isOverdue ? "bg-red-600 hover:bg-red-500" : "hover:brightness-110"
                                            )}
                                            onClick={() => onStartFocus(item)}
                                        >
                                            {isOverdue ? 'Revisar Agora' : 'Iniciar'}
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
