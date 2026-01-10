import React from 'react';
// import { Tooltip as ReactTooltip } from 'react-tooltip'; // Wait, standard tooltip is fine or custom. I'll build custom grid.
import { format, eachDayOfInterval, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HeatmapWidgetProps {
    dailyHistory: Record<string, number>;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({ dailyHistory }) => {
    // We'll show the last 365 days (or approx 1 year) like GitHub
    const today = new Date();
    // Start approx 52 weeks ago to fill grid nicely
    // 52 weeks * 7 = 364 days.
    const startDate = subWeeks(today, 52);

    // Generate dates
    const dates = eachDayOfInterval({ start: startDate, end: today });

    // Determine color based on minutes
    const getColor = (minutes: number) => {
        if (minutes === 0) return 'bg-slate-800/50';
        if (minutes < 30) return 'bg-blue-900/40';
        if (minutes < 60) return 'bg-blue-800/60';
        if (minutes < 120) return 'bg-blue-600/80';
        return 'bg-blue-500'; // High level
    };

    return (
        <div className="bg-slate-900/60 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto custom-scrollbar">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                Mapa de Consistência (Último Ano)
            </h3>

            <div className="flex gap-1 min-w-max">
                {/* We need to group by Week (Columns) */}
                {/* 
                    Logic: 
                    Grid is 7 rows (Sun-Sat).
                    Columns are weeks.
                */}

                {Array.from({ length: 53 }).map((_, weekIndex) => {
                    return (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                // Calculate actual date for this cell
                                // Grid fills column first (days of week)
                                // start date might not be Sunday. Adjust.
                                // Actually, simpler: just map the Flat 'dates' array into chunks of 7?
                                // No, because we want row=DayOfWeek.

                                // Let's iterate weeks, then days.
                                // StartDate should ideally be a Sunday to align grid?
                                // If startDate is Wednesday, first col has empty slots top?
                                // Assuming standard alignment.

                                const dayOffset = weekIndex * 7 + dayIndex;
                                if (dayOffset >= dates.length) return null;

                                const date = dates[dayOffset];
                                const minutes = dailyHistory[format(date, 'yyyy-MM-dd')] || 0;
                                const dateStr = format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
                                const durationStr = minutes > 0 ? `${Math.floor(minutes / 60)}h ${minutes % 60} m` : 'Sem atividade';

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`w - 3 h - 3 rounded - sm ${getColor(minutes)} hover: ring - 1 hover: ring - white transition - all relative group cursor - pointer`}
                                        title={`${dateStr}: ${durationStr} `} // Native tooltip for simplicity
                                    >
                                    </div>
                                );
                            })}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-500">
                <span>Menos</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
                    <div className="w-3 h-3 rounded-sm bg-blue-900/40" />
                    <div className="w-3 h-3 rounded-sm bg-blue-800/60" />
                    <div className="w-3 h-3 rounded-sm bg-blue-600/80" />
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                </div>
                <span>Mais</span>
            </div>
        </div>
    );
};
