import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { ThemeCard } from '../../themes/components/ThemeCard';
import { AddThemeModal } from '../../themes/components/AddThemeModal';
import { ThemeDetailsModal } from '../../themes/components/ThemeDetailsModal';
import { useStudy } from '../../../context/StudyContext';
import { useSRSLogic } from '../../../hooks/useSRSLogic';
import type { Theme } from '../../../types';

const StudyContentModal = React.lazy(() => import('../../themes/components/StudyContentModal').then(m => ({ default: m.StudyContentModal })));

interface MobileThemesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileThemesModal: React.FC<MobileThemesModalProps> = ({ isOpen, onClose }) => {
    const { themes, deleteTheme, updateSubthemeContent, unlockedSubthemes, completeReview } = useStudy();
    const { calculateQueuedDates, getThemeCompletionDate } = useSRSLogic();

    const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedThemeForDetails, setSelectedThemeForDetails] = useState<Theme | null>(null);
    const [selectedSubthemeForNotes, setSelectedSubthemeForNotes] = useState<any>(null);

    // Filter out projects, show only study themes
    const studyThemes = themes.filter(t => t.category !== 'project');
    const queuedSubthemesMap = calculateQueuedDates(studyThemes);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title=""
                maxWidth="full"
                padding={false}
                className="h-[95vh] md:h-auto"
            >
                <div className="h-full flex flex-col bg-slate-950">
                    {/* Header - Fixed */}
                    <div className="flex-none bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/10 p-6 pb-5">
                        <div className="mb-4">
                            <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
                                Meus Temas
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Gerencie suas trilhas de conhecimento
                            </p>
                        </div>

                        {/* Add Theme Button */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Novo Tema
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 pb-8">
                        {studyThemes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-5xl">📚</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    Nenhum Tema Criado
                                </h3>
                                <p className="text-slate-400 mb-6 max-w-sm">
                                    Crie seu primeiro tema de estudos para começar a organizar seu conhecimento.
                                </p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg"
                                >
                                    Criar Primeiro Tema
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {studyThemes.map(theme => (
                                    <div key={theme.id} className="w-full">
                                        <ThemeCard
                                            theme={theme}
                                            completionDate={getThemeCompletionDate(theme, queuedSubthemesMap)}
                                            onEdit={() => setEditingTheme(theme)}
                                            onDelete={() => deleteTheme(theme.id)}
                                            onOpenNotes={setSelectedSubthemeForNotes}
                                            onOpenDetails={() => setSelectedThemeForDetails(theme)}
                                            queuedSubthemesMap={queuedSubthemesMap}
                                            unlockedSubthemes={unlockedSubthemes}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modals */}
            <AddThemeModal
                isOpen={!!editingTheme || isAddModalOpen}
                onClose={() => {
                    setEditingTheme(undefined);
                    setIsAddModalOpen(false);
                }}
                themeToEdit={editingTheme}
                defaultCategory="study"
            />

            <ThemeDetailsModal
                isOpen={!!selectedThemeForDetails}
                onClose={() => setSelectedThemeForDetails(null)}
                theme={selectedThemeForDetails}
            />

            <React.Suspense fallback={null}>
                <StudyContentModal
                    isOpen={!!selectedSubthemeForNotes}
                    onClose={() => setSelectedSubthemeForNotes(null)}
                    subtheme={selectedSubthemeForNotes}
                    onSave={(content: string) => {
                        updateSubthemeContent(selectedSubthemeForNotes.id, content);

                        const todayStr = new Date().toISOString().split('T')[0];
                        const pendingReview = selectedSubthemeForNotes.reviews.find((r: any) =>
                            r.status === 'pending' && r.date <= todayStr
                        );

                        if (pendingReview) {
                            completeReview(selectedSubthemeForNotes.id, pendingReview.number, 'review', 'medium');
                        }

                        setSelectedSubthemeForNotes(null);
                    }}
                />
            </React.Suspense>
        </>
    );
};
