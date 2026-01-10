import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format, eachDayOfInterval, subWeeks } from 'date-fns';
import type { Theme, Task, Goal } from '../../../types';

interface CategoryDistributionChartProps {
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ themes, tasks, goals }) => {
    // Process categories
    const categories: Record<string, number> = {};

    // From Themes/Subthemes
    themes.forEach(theme => {
        const cat = theme.category || 'Estudos';
        const minutes = theme.subthemes.reduce((acc, st) => acc + (st.timeSpent || 0), 0);
        categories[cat] = (categories[cat] || 0) + minutes;
    });

    // From Tasks
    tasks.forEach(task => {
        const cat = 'Tarefas';
        categories[cat] = (categories[cat] || 0) + (task.timeSpent || 0);
    });

    // From Goals
    goals.forEach(goal => {
        const cat = goal.category || 'Metas';
        categories[cat] = (categories[cat] || 0) + (goal.timeSpent || 0);
    });

    const data = Object.entries(categories)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    // Fallback if no data
    if (data.length === 0) {
        data.push({ name: 'Sem dados', value: 1 });
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                </div>
                Distribuição de Foco
            </h3>

            <div className="flex-1 min-h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
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
                            formatter={(value: number) => [`${value} min`, 'Tempo']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-slate-400 text-xs font-bold uppercase tracking-wider ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
