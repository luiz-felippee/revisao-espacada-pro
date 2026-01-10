import { useState, useMemo, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Brain } from 'lucide-react';

// Mock Data Generation for Visuals
// In real app, this would query 'reviews' table for pass/fail rates per day
const generateData = (days: number) => {
    const data: { date: string; fullDate: string; retention: number; reviews: number }[] = [];
    const today = new Date();
    let retentionBase = 85;

    for (let i = days; i >= 0; i--) {
        const date = subDays(today, i);
        // Simulate realistic fluctuation
        const randomFlux = (Math.random() - 0.5) * 5;
        retentionBase = Math.min(100, Math.max(70, retentionBase + randomFlux));

        data.push({
            date: format(date, 'MMM dd', { locale: ptBR }),
            fullDate: format(date, 'ddMMM yyyy', { locale: ptBR }),
            retention: Math.round(retentionBase),
            reviews: Math.floor(Math.random() * 20) + 5
        });
    }
    return data;
};

export const RetentionChart = () => {
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');



    const [data, setData] = useState<{ date: string; fullDate: string; retention: number; reviews: number }[]>([]);

    useEffect(() => {
        setData(generateData(timeRange === 'week' ? 7 : 14));
    }, [timeRange]);

    return (
        <div className="bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl group transition-all duration-500 hover:border-purple-500/20">
            {/* Realistic Glossy Highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 border border-white/5 shadow-inner">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Qualidade da Memória</h3>
                        <p className="text-sm text-slate-400 font-medium">Índice de retenção neural</p>
                    </div>
                </div>

                <div className="flex bg-slate-900/80 rounded-xl p-1 border border-white/10 shadow-inner">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${timeRange === 'week' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        7 DIAS
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${timeRange === 'month' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        30 DIAS
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} /> {/* Purple-400 */}
                                <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                            fontFamily="Inter, sans-serif"
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            domain={[60, 100]}
                            fontFamily="Inter, sans-serif"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                                padding: '12px 16px',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            cursor={{ stroke: '#c084fc', strokeWidth: 2, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="retention"
                            stroke="#c084fc"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorRetention)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stat Footer */}
            <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/5 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Média Atual</span>
                    </div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                        {Math.round(data[data.length - 1].retention)}%
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+2.4%</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Revisões</span>
                    </div>
                    <div className="text-3xl font-black text-white">
                        {data.reduce((acc, cur) => acc + cur.reviews, 0)}
                    </div>
                </div>
            </div>

            {/* Ambient Background Decoration */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>
    );
};
