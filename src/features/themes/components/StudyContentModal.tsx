import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Save, Clock, Brain, History, Sparkles, Maximize2 } from 'lucide-react';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { Modal } from '../../../components/ui/Modal';
import { cn } from '../../../lib/utils';
import type { Subtheme } from '../../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SummaryTimeline from '../../../components/ui/SummaryTimeline';

interface StudyContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtheme: Subtheme | null;
    onSave: (content: string) => void;
}

export const StudyContentModal: React.FC<StudyContentModalProps> = ({ isOpen, onClose, subtheme, onSave }) => {
    const [content, setContent] = useState(subtheme?.text_content || '');
    const [activeTab, setActiveTab] = useState<'content' | 'history'>('content');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Update internal content when subtheme changes
    React.useEffect(() => {
        if (subtheme) {
            setContent(subtheme.text_content || '');
        }
    }, [subtheme]);

    if (!subtheme) return null;

    const timeSpentH = Math.floor((subtheme.timeSpent || 0) / 60);
    const timeSpentM = (subtheme.timeSpent || 0) % 60;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={null} // Custom Header
            maxWidth={isFullscreen ? 'full' : '3xl'}
            padding={false}
            className={cn("transition-all duration-500", isFullscreen ? "h-[95vh]" : "h-[85vh]")}
        >
            <div className="flex flex-col h-full bg-slate-950 overflow-hidden rounded-2xl border border-slate-800/50 shadow-2xl">
                {/* Custom Header */}
                <div className="p-6 border-b border-slate-800/50 bg-slate-900/40 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{subtheme.title}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {timeSpentH}h {timeSpentM}m de Estudo
                                    </span>
                                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                        <Brain className="w-3 h-3" />
                                        SRS Nível {subtheme.reviews.filter(r => r.status === 'completed').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800/50 rounded-xl text-slate-500 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-6 p-1 bg-black/40 rounded-xl w-fit border border-slate-800/50">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                activeTab === 'content' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <FileTextIcon className="w-3.5 h-3.5" />
                            Conteúdo Principal
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                                activeTab === 'history' ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <History className="w-3.5 h-3.5" />
                            Diário & Resumos
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'content' ? (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Anotações do Módulo</h3>
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[10px] font-bold uppercase transition-all border border-indigo-500/20">
                                            <Sparkles className="w-3 h-3" />
                                            Gerar com IA
                                        </button>
                                    </div>
                                </div>

                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                />

                                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white">Modo de Leitura Focado</p>
                                        <p className="text-[10px] text-slate-500">Expanda para estudar sem distrações.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold"
                                    >
                                        {isFullscreen ? 'REDUZIR' : 'ABRIR'}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {(!subtheme.summaries || subtheme.summaries.length === 0) && (!subtheme.reviews || subtheme.reviews.filter(r => r.status === 'completed').length === 0) ? (
                                    <div className="text-center py-20 bg-slate-900/20 rounded-[2rem] border border-dashed border-slate-800">
                                        <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Nenhum resumo disponível ainda.</p>
                                        <p className="text-xs text-slate-600 mt-1">Conclua uma revisão para registrar seus aprendizados.</p>
                                    </div>
                                ) : (
                                    <SummaryTimeline summaries={subtheme.summaries || []} title="Histórico de Estudos" />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {activeTab === 'content' && (
                    <div className="p-4 border-t border-slate-800/50 bg-slate-900/40 shrink-0 flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 font-medium italic">
                            Alt + S para salvar rapidamente
                        </p>
                        <button
                            onClick={() => onSave(content)}
                            className="group relative flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const FileTextIcon = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
);
