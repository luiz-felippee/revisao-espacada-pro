import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyFocusChartProps {
    dailyHistory: Record<string, number>; // date "yyyy-MM-dd": minutes
}

export const WeeklyFocusChart: React.FC<WeeklyFocusChartProps> = ({ dailyHistory }) => {
    // Generate last 7 days data
    const today = format(new Date(), 'yyyy-MM-dd');
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i); // Last 7 days including today
        const dateStr = format(date, 'yyyy-MM-dd');
        const isToday = dateStr === today;
        return {
            name: format(date, 'EEE', { locale: ptBR }), // Mon, Tue...
            fullDate: format(date, "d 'de' MMMM", { locale: ptBR }),
            minutes: dailyHistory[dateStr] || 0,
            originalDate: date,
            isToday
        };
    });

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                    <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{payload[0].payload.fullDate}</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                        {Math.floor(payload[0].value / 60)}<span className="text-sm font-medium text-slate-500 ml-0.5 mr-2">h</span>
                        {payload[0].value % 60}<span className="text-sm font-medium text-slate-500 ml-0.5">m</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl hover:bg-slate-800/40 transition-colors group">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                        Foco nos Últimos 7 Dias
                    </h3>
                </div>
            </div>

            <div className="h-72 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={(props) => {
                                const { x, y, payload, index } = props;
                                const entry = data[index];
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <text
                                            x={0}
                                            y={0}
                                            dy={-10}
                                            textAnchor="middle"
                                            fill={entry?.isToday ? '#60a5fa' : '#e2e8f0'}
                                            fontSize={14}
                                            fontWeight={entry?.isToday ? 700 : 600}
                                        >
                                            {payload.value}
                                        </text>
                                        {entry?.isToday && (
                                            <text
                                                x={0}
                                                y={0}
                                                dy={8}
                                                textAnchor="middle"
                                                fill="#60a5fa"
                                                fontSize={10}
                                                fontWeight={700}
                                            >
                                                HOJE
                                            </text>
                                        )}
                                    </g>
                                );
                            }}
                        />
                        <YAxis
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                        />
                        <Bar
                            dataKey="minutes"
                            radius={[8, 8, 8, 8]}
                            className="transition-all duration-300"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isToday ? "url(#barGradientHover)" : "url(#barGradient)"}
                                    className="hover:opacity-100 opacity-80 transition-all cursor-pointer hover:filter hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
