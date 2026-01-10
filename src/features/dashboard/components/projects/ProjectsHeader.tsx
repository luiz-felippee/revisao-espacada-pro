import { Layout, Plus, BookOpen, Target, X } from 'lucide-react';
import { useState } from 'react';

interface ProjectsHeaderProps {
    onClose: () => void;
    onOpenGoalModal: (type?: 'checklist') => void;
    onOpenThemeModal: () => void;
}

export const ProjectsHeader = ({ onClose, onOpenGoalModal, onOpenThemeModal }: ProjectsHeaderProps) => {
    const [isNewProjectMenuOpen, setIsNewProjectMenuOpen] = useState(false);

    return (
        <div className="p-6 border-b border-slate-800 flex flex-col gap-6 shrink-0 bg-slate-900/50 backdrop-blur-xl z-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Layout className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Meus Projetos</h2>
                        <p className="text-sm text-slate-400">Acompanhamento e Gestão</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    {/* New Project Button (Dropdown Trigger) */}
                    <button
                        onClick={() => setIsNewProjectMenuOpen(!isNewProjectMenuOpen)}
                        className={`flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 active:scale-95 ${isNewProjectMenuOpen ? 'ring-2 ring-white/20' : ''}`}
                    >
                        <Plus className="w-4 h-4" />
                        Novo
                    </button>

                    {/* Dropdown Menu */}
                    {isNewProjectMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsNewProjectMenuOpen(false)}
                            />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            onOpenThemeModal();
                                            setIsNewProjectMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <div className="p-1.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 border border-purple-500/20">
                                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold">Mundo</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Tema de Estudo</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            onOpenGoalModal('checklist');
                                            setIsNewProjectMenuOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 border border-emerald-500/20">
                                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold">Projeto</div>
                                            <div className="text-[10px] text-slate-500 font-medium">Meta / Checklist</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors ml-2"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};
