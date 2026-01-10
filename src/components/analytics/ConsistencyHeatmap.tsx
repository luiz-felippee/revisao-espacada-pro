import React, { useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    YAxis
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Zap } from 'lucide-react';

export const ConsistencyHeatmap: React.FC = () => {
    const { gamification } = useStudy();

    const data = useMemo(() => {
        if (!gamification?.stats?.dailyHistory) return [];

        const history = gamification.stats.dailyHistory;
        const today = new Date();
        const daysToShow = 14;

        return Array.from({ length: daysToShow }, (_, i) => {
            const d = subDays(today, (daysToShow - 1) - i);
            const dateStr = format(d, 'yyyy-MM-dd');
            return {
                fullDate: dateStr,
                date: format(d, 'dd/MM', { locale: ptBR }),
                minutes: history[dateStr] || 0
            };
        });
    }, [gamification]);

    const averageMinutes = useMemo(() => {
        const total = data.reduce((acc, curr) => acc + curr.minutes, 0);
        return Math.round(total / 14 || 0);
    }, [data]);

    if (!gamification || !gamification.stats) {
        return null;
    }

    return (
        <div className="w-full bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 md:p-6 relative overflow-hidden shadow-2xl group">
            {/* Realistic Glossy Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Background Glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />


            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 border border-white/5 shadow-inner flex-shrink-0">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-xl tracking-tight">Ritmo de Estudos</h3>
                        <p className="text-sm text-slate-400 font-medium">Sua consistência nas últimas 2 semanas</p>
                    </div>
                </div>

                {/* Stats Summary Badge */}
                <div className="bg-slate-900/80 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md w-full sm:w-auto mt-2 sm:mt-0 flex justify-between sm:block items-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-0 sm:mb-0.5">Média Diária</span>
                    <span className="text-lg font-bold text-white">
                        {averageMinutes} min
                    </span>
                </div>
            </div>

            <div className="h-[280px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900/90 border border-slate-700/50 p-3 rounded-xl shadow-xl backdrop-blur-xl">
                                            <p className="text-slate-300 text-xs font-medium mb-1">{label}</p>
                                            <p className="text-white font-bold text-sm">
                                                {payload[0].value} minutos
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }}
                            dy={10}
                            interval={1}
                        />
                        {/* YAxis hidden but present for scaling */}
                        <YAxis hide domain={[0, 'auto']} />
                        <Area
                            type="monotone"
                            dataKey="minutes"
                            stroke="#60a5fa"
                            strokeWidth={3}
                            fill="url(#colorMinutes)"
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom fading reflection */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
        </div>
    );
};
