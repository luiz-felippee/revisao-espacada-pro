import { Trash2, Pencil, Plus } from 'lucide-react';
import { useConfirm } from '../../../../context/ConfirmContext';
import { LinkedProjectCard } from './LinkedProjectCard';
import { IconRenderer } from '../../../../components/ui/IconRenderer';

interface ThemeProjectCardProps {
    theme: any;
    linkedProjects: any[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEditTheme: (theme: any) => void;
    onDeleteTheme: (id: string) => void;
    onAddGoalToTheme: (themeId: string) => void;

    // For linked logic
    allGoals: any[]; // Need full goals to pass to linked card logic logic
    onEditGoal: (goal: any) => void;
    onDeleteGoal: (id: string) => void;
}

export const ThemeProjectCard = ({
    theme, linkedProjects, isExpanded, onToggleExpand,
    onEditTheme, onDeleteTheme, onAddGoalToTheme,
    allGoals, onEditGoal, onDeleteGoal
}: ThemeProjectCardProps) => {
    const { confirm } = useConfirm();
    return (
        <div className={`flex flex-col bg-slate-800/30 border rounded-2xl transition-all duration-300 ${isExpanded ? 'border-indigo-500/30 bg-slate-800/50' : 'border-slate-800/50 hover:bg-slate-800/50'}`}>
            {/* Theme Header Card */}
            <div className="relative flex p-5 cursor-pointer group" onClick={onToggleExpand}>
                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-1000 rounded-b-2xl" style={{ width: `${theme.progress}%`, color: theme.color }} />
                )}

                {/* Theme Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEditTheme(theme); }}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/5"
                        title="Editar Detalhes do Tema"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            const confirmed = await confirm({
                                title: 'Excluir Tema',
                                message: `Tem certeza que deseja excluir o tema "${theme.title}" e todos os projetos vinculados?`,
                                confirmText: 'Excluir Tudo',
                                cancelText: 'Cancelar',
                                isDangerous: true
                            });
                            if (confirmed) onDeleteTheme(theme.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Theme Content */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl shadow-lg border border-white/5 relative group-hover:scale-110 transition-transform flex items-center justify-center">
                        <IconRenderer icon={theme.icon} size={20} className="text-white" />
                        {linkedProjects.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 border-2 border-slate-900">
                                {linkedProjects.length}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Tema
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-200 text-lg">{theme.title}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                            {theme.itemCount} módulos de estudo
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Content (Nested Projects) */}
            {isExpanded && (
                <div className="border-t border-white/5 bg-slate-950/20 p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos neste Tema</h4>
                        <button onClick={() => onAddGoalToTheme(theme.id)} className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Adicionar Projeto
                        </button>
                    </div>

                    {linkedProjects.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                            <p className="text-xs text-slate-500 mb-2">Nenhum projeto vinculado.</p>
                            <button onClick={() => onAddGoalToTheme(theme.id)} className="text-xs text-blue-400 hover:underline">Criar primeiro projeto</button>
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                                {linkedProjects.map(goal => (
                                    <LinkedProjectCard
                                        key={goal.id}
                                        goal={goal}
                                        fullGoal={allGoals.find(g => g.id === goal.id)}
                                        onEdit={onEditGoal}
                                        onDelete={onDeleteGoal}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
