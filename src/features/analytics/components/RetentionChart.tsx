import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Theme, Review } from '../../../types';

interface RetentionChartProps {
    themes: Theme[];
}

export const RetentionChart: React.FC<RetentionChartProps> = ({ themes }) => {
    const data = useMemo(() => {
        const allCompletedReviews: Review[] = [];
        themes.forEach(t => {
            t.subthemes.forEach(st => {
                st.reviews.forEach(r => {
                    if (r.status === 'completed' && r.completedAt) {
                        allCompletedReviews.push(r);
                    }
                });
            });
        });

        if (allCompletedReviews.length === 0) {
            // Return some default placeholder data if empty, but slightly dynamic
            return [
                { name: format(subMonths(new Date(), 2), 'MMM', { locale: ptBR }), rate: 0 },
                { name: format(subMonths(new Date(), 1), 'MMM', { locale: ptBR }), rate: 0 },
                { name: format(new Date(), 'MMM', { locale: ptBR }), rate: 0 },
            ];
        }

        // Calculate for last 6 months
        const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));

        return months.map(month => {
            const start = startOfMonth(month);
            const end = endOfMonth(month);

            const monthReviews = allCompletedReviews.filter(r => {
                const completedDate = parseISO(r.completedAt!);
                return isWithinInterval(completedDate, { start, end });
            });

            if (monthReviews.length === 0) {
                return { name: format(month, 'MMM', { locale: ptBR }), rate: 0 };
            }

            const totalScore = monthReviews.reduce((acc, r) => {
                switch (r.difficulty) {
                    case 'easy': return acc + 100;
                    case 'hard': return acc + 60;
                    default: return acc + 90; // Medium
                }
            }, 0);

            return {
                name: format(month, 'MMM', { locale: ptBR }),
                rate: Math.round(totalScore / monthReviews.length)
            };
        });
    }, [themes]);

    const latestRate = data[data.length - 1]?.rate || 0;

    return (
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-slate-800/40 transition-colors group">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        </div>
                        Qualidade de Retenção
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Baseado em {themes.reduce((acc, t) => acc + t.subthemes.reduce((as, st) => as + st.reviews.filter(r => r.status === 'completed').length, 0), 0)} revisões</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-white">{latestRate}%</span>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">Este mês</p>
                </div>
            </div>

            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRatePink" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                color: '#fff',
                                backdropFilter: 'blur(12px)',
                                fontSize: '10px'
                            }}
                            itemStyle={{ color: '#f472b6', fontWeight: 'bold' }}
                            cursor={{ stroke: '#ec4899', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="#ec4899"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRatePink)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
