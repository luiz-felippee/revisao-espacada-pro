import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Quote, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import type { Subtheme } from '../../../types';
import SummaryTimeline from '../../../components/ui/SummaryTimeline';

interface SummaryHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtheme: Subtheme;
}

export const SummaryHistoryModal: React.FC<SummaryHistoryModalProps> = ({ isOpen, onClose, subtheme }) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl pointer-events-auto flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50 rounded-t-2xl">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                                        <BookOpen className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Diário de Aprendizado</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{subtheme.title}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                <SummaryTimeline
                                    summaries={subtheme.summaries || []}
                                    title="Histórico de Revisão"
                                    showEmptyState={true}
                                />
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
