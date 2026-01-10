import { Star } from 'lucide-react';
import { XP_TABLE_DISPLAY } from '../../config/gamification.config';
import { cn } from '../../lib/utils';

export const XPTableTab = () => {
    return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Tabela de Recompensas
            </h3>
            <div className="grid grid-cols-1 gap-2">
                {XP_TABLE_DISPLAY.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-300", item.color.replace('text-', 'bg-').replace('400', '500/10'))}>
                                <item.icon className={cn("w-5 h-5", item.color)} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Ação</p>
                            </div>
                        </div>
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold font-mono border border-current bg-opacity-10", item.color)}>
                            +{item.value} XP
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
