import { Filter, PlayCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export type ProjectFilterType = 'all' | 'active' | 'completed' | 'overdue';

interface ProjectsFilterProps {
    filter: ProjectFilterType;
    setFilter: (f: ProjectFilterType) => void;
}

export const ProjectsFilter = ({ filter, setFilter }: ProjectsFilterProps) => {
    return (
        <div className="px-6 pb-2 shrink-0 bg-slate-900/50 backdrop-blur-xl z-10 overflow-x-auto">
            <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-white/5 w-fit">
                {[
                    { id: 'all', label: 'Todos', icon: Filter },
                    { id: 'active', label: 'Em Andamento', icon: PlayCircle },
                    { id: 'overdue', label: 'Atrasados', icon: AlertTriangle },
                    { id: 'completed', label: 'Concluídos', icon: CheckCircle2 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as ProjectFilterType)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
                            filter === tab.id
                                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        )}
                    >
                        <tab.icon className={cn(
                            "w-3.5 h-3.5",
                            filter === tab.id
                                ? tab.id === 'overdue' ? 'text-red-400'
                                    : tab.id === 'completed' ? 'text-emerald-400'
                                        : 'text-blue-400'
                                : ''
                        )} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
