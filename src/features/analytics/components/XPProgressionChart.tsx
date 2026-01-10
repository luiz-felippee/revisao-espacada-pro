import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface XPProgressionChartProps {
    dailyHistory: Record<string, number>;
    currentXP: number;
    currentLevel: number;
}

export const XPProgressionChart: React.FC<XPProgressionChartProps> = ({ dailyHistory, currentXP, currentLevel }) => {
    const chartData = useMemo(() => {
        // Get last 30 days
        const data: { date: string; xp: number; displayDate: string }[] = [];
        const today = new Date();
        let cumulativeXP = 0;

        // Sort dates to accumulate XP correctly
        const sortedDates = Object.keys(dailyHistory).sort();

        // Get only last 30 entries
        const last30Dates = sortedDates.slice(-30);

        last30Dates.forEach(dateStr => {
            const minutes = dailyHistory[dateStr] || 0;
            // XP calculation: 10 XP per focused minute
            const dailyXP = minutes * 10;
            cumulativeXP += dailyXP;

            data.push({
                date: dateStr,
                xp: cumulativeXP,
                displayDate: format(new Date(dateStr), "d 'de' MMM", { locale: ptBR })
            });
        });

        // If we don't have 30 days of data, fill backwards
        const daysToFill = 30 - data.length;
        for (let i = daysToFill; i > 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (30 - i));
            data.unshift({
                date: format(date, 'yyyy-MM-dd'),
                xp: 0,
                displayDate: format(date, "d 'de' MMM", { locale: ptBR })
            });
        }

        return data;
    }, [dailyHistory]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 backdrop-blur-sm shadow-xl">
                    <p className="text-white font-bold text-sm mb-1">{payload[0].payload.displayDate}</p>
                    <p className="text-blue-400 font-black text-lg">
                        {payload[0].value.toLocaleString()} XP
                    </p>
                </div>
            );
        }
        return null;
    };

    const maxXP = Math.max(...chartData.map(d => d.xp), currentXP);
    const growthRate = chartData.length > 1
        ? ((chartData[chartData.length - 1].xp - chartData[0].xp) / Math.max(chartData[0].xp, 1) * 100).toFixed(1)
        : '0';

    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full" />
                        Evolução de XP (Últimos 30 Dias)
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 ml-4">
                        Crescimento total: {currentXP.toLocaleString()} XP
                    </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-bold">+{growthRate}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">últimos 30 dias</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis
                        dataKey="displayDate"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#xpGradient)"
                        dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#1e40af' }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Level Indicator */}
            <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((currentXP % 1000) / 10, 100)}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-slate-400">
                    Nível {currentLevel}
                </span>
            </div>
        </div>
    );
};
