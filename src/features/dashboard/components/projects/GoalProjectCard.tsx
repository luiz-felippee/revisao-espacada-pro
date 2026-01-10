import { Trash2 } from 'lucide-react';

interface GoalProjectCardProps {
    project: any;
    onEdit: (goal: any) => void;
    onDelete: (id: string) => void;
}

export const GoalProjectCard = ({ project, onEdit, onDelete }: GoalProjectCardProps) => {
    return (
        <div
            className="flex flex-col p-5 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800/50 hover:border-emerald-500/30 rounded-2xl transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]"
            onClick={() => onEdit(project)}
        >
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-1000" style={{ width: `${project.progress}%`, color: project.color }} />

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                }}
                className="absolute top-4 right-4 p-2 bg-slate-900/90 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all z-20 shadow-sm border border-white/5"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    {project.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Meta</span>
                    </div>
                    <h3 className="font-bold text-slate-200 line-clamp-1">{project.title}</h3>
                </div>
            </div>
            <div className="mt-auto flex justify-between text-xs text-slate-400">
                <span>{Math.round(project.progress)}% concluído</span>
                <span>{project.itemCount} itens</span>
            </div>
        </div >
    );
};
