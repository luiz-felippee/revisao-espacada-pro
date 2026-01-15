import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileProjectsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileProjectsModal: React.FC<MobileProjectsModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleNavigateToProjects = () => {
        navigate('/projects');
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[61] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Meus Projetos</h2>
                                    <p className="text-xs text-slate-400">Acompanhamento e Gestão</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors touch-manipulation"
                            >
                                <X className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                            {/* Quick Actions */}
                            <div className="mb-6">
                                <button
                                    onClick={handleNavigateToProjects}
                                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 touch-manipulation"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Criar Primeiro Projeto</span>
                                </button>
                            </div>

                            {/* Project Categories */}
                            <div className="space-y-2 mb-6">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categorias</h3>

                                {['Todos (0)', 'Planejando (0)', 'Ativos (0)', 'Pausados (0)', 'Concluídos (0)'].map((category, idx) => (
                                    <button
                                        key={idx}
                                        onClick={handleNavigateToProjects}
                                        className="w-full bg-slate-800/50 hover:bg-slate-800 text-left px-4 py-3 rounded-xl transition-all border border-slate-700/50 hover:border-blue-500/30 group touch-manipulation"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                                                {category}
                                            </span>
                                            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Empty State */}
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">Nenhum projeto ainda</h3>
                                <p className="text-sm text-slate-400 mb-4 max-w-xs mx-auto">
                                    Crie seu primeiro projeto para começar a organizar suas entregas
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};
