import React from 'react';
import { type LucideIcon, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils'; // Assuming global utils path

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    color?: string; // Hex or Tailwind class prefix logic needed? Let's generic color class or style
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, description, color = "blue" }) => {
    // Map generic colors to specific tailwind classes for gradients/borders
    const colorStyles = {
        blue: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
        amber: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
        purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
        emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
        rose: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400",
    };

    const activeStyle = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;
    const gradientBg = `bg-gradient-to-br ${activeStyle.split(' ').slice(0, 2).join(' ')}`;
    const borderColor = activeStyle.split(' ').find(c => c.startsWith('border-')) || "border-white/10";
    const iconColor = activeStyle.split(' ').find(c => c.startsWith('text-')) || "text-slate-400";

    return (
        <div className={cn(
            "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 group",
            "bg-slate-900/40 backdrop-blur-xl hover:bg-slate-800/40",
            borderColor,
            "hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
        )}>
            {/* Background Glow Effect */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", gradientBg)} />

            <div className={`absolute -right-6 -top-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                <Icon className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 shadow-lg backdrop-blur-sm", iconColor)}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>

                <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-sm">{value}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</span>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border",
                                trend.isPositive
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}>
                                <TrendingUp className={cn("w-3 h-3", !trend.isPositive && "rotate-180")} />
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </div>
                        )}
                    </div>

                    {description && (
                        <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-2">
                            <div className={cn("w-1 h-1 rounded-full", iconColor.replace('text-', 'bg-'))} />
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
