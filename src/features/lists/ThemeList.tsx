import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStudy } from '../../context/StudyContext';
import { Layers } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { AddThemeModal } from '../themes/components/AddThemeModal';
import { Modal } from '../../components/ui/Modal';

import type { Theme } from '../../types';
import { ThemeCard } from '../themes/components/ThemeCard';
import { useSRSLogic } from '../../hooks/useSRSLogic';
import SEO from '../../components/SEO';
// Lazy load StudyContentModal

import { ThemeDetailsModal } from '../themes/components/ThemeDetailsModal';

interface ThemeListProps {
    forceCategory?: 'project' | 'study';
    defaultCategory?: 'project' | 'study';
}


// Lazy Definition
const StudyContentModal = React.lazy(() => import('../themes/components/StudyContentModal').then(m => ({ default: m.StudyContentModal })));

export const ThemeList = ({ forceCategory, defaultCategory }: ThemeListProps = {}) => {
    // ...

    const { themes, deleteTheme, updateSubthemeContent, unlockedSubthemes, completeReview } = useStudy();
    const { calculateQueuedDates, getThemeCompletionDate } = useSRSLogic();
    const [editingTheme, setEditingTheme] = useState<Theme | undefined>(undefined);
    const [selectedSubthemeForNotes, setSelectedSubthemeForNotes] = useState<any>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedThemeForDetails, setSelectedThemeForDetails] = useState<Theme | null>(null);

    const [searchParams] = useSearchParams();
    // Use forceCategory prop if provided, otherwise use query param
    const categoryFilter = forceCategory || searchParams.get('category');

    // Filter themes based on category
    // If category='project', show ONLY projects. Otherwise, show study themes (exclude projects)
    const visibleThemes = categoryFilter === 'project'
        ? themes.filter(t => t.category === 'project')
        : themes.filter(t => t.category !== 'project');

    // Queue Logic
    const queuedSubthemesMap = calculateQueuedDates(visibleThemes);

    const Cell = ({ columnIndex, rowIndex, style, data }: any) => {
        const { themes, columnCount, onEdit, onDelete, getCompletion, ...rest } = data;
        const index = rowIndex * columnCount + columnIndex;

        if (index >= themes.length) {
            return null;
        }

        const theme = themes[index];

        return (
            <div style={{ ...style, padding: '12px' }}>
                <ThemeCard
                    theme={theme}
                    completionDate={getCompletion(theme)}
                    onEdit={() => onEdit(theme)}
                    onDelete={() => onDelete(theme.id)}
                    {...rest}
                />
            </div>
        );
    };

    return (
        <>
            <SEO
                title="Meus Temas"
                description="Organize seus estudos por temas e subtemas. Sistema de repetição espaçada (SRS), flashcards e tracking de progresso para máxima retenção."
                keywords={['temas', 'estudos', 'organização', 'subtemas', 'SRS', 'flashcards', 'trilha de conhecimento']}
                url="https://study-panel.vercel.app/themes"
            />

            <div className="h-[calc(100vh-6rem)] flex flex-col gap-6 pb-4">
                {/* Header with Glow */}
                <div className="shrink-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                    <div>
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-2">
                            {categoryFilter === 'project' ? 'Meus Projetos' : 'Meus Mundos de Estudo'}
                        </h2>
                        <p className="text-slate-400 max-w-2xl">
                            {categoryFilter === 'project'
                                ? 'Organize e acompanhe seus projetos e objetivos práticos.'
                                : 'Gerencie suas trilhas de conhecimento e acompanhe o progresso de cada universo.'}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="group relative px-6 py-3 bg-slate-900 rounded-xl font-bold text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden ring-1 ring-white/10 shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center gap-2">
                            <span className="text-xl leading-none font-light mb-0.5">+</span>
                            Novo Tema
                        </span>
                    </button>
                </div>

                {/* List with AutoSizer */}
                <div className="flex-1 min-h-0">
                    {visibleThemes.length === 0 ? (
                        <div className="glass-card text-center py-20 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-xl shadow-black/20 group-hover:scale-110 transition-transform duration-500">
                                    <Layers className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Seu Universo está Vazio</h3>
                                <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">Crie seu primeiro tema de estudos para começar a organizar seu conhecimento.</p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 ring-1 ring-white/20"
                                >
                                    Criar Primeiro Tema
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                            {visibleThemes.map(theme => (
                                <ThemeCard
                                    key={theme.id}
                                    theme={theme}
                                    completionDate={getThemeCompletionDate(theme, queuedSubthemesMap)}
                                    onEdit={() => setEditingTheme(theme)}
                                    onDelete={() => deleteTheme(theme.id)}
                                    onOpenNotes={setSelectedSubthemeForNotes}
                                    onOpenDetails={() => setSelectedThemeForDetails(theme)}
                                    queuedSubthemesMap={queuedSubthemesMap}
                                    unlockedSubthemes={unlockedSubthemes}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <AddThemeModal
                    isOpen={!!editingTheme || isAddModalOpen}
                    onClose={() => {
                        setEditingTheme(undefined);
                        setIsAddModalOpen(false);
                    }}
                    themeToEdit={editingTheme}
                    defaultCategory={defaultCategory}
                />

                <ThemeDetailsModal
                    isOpen={!!selectedThemeForDetails}
                    onClose={() => setSelectedThemeForDetails(null)}
                    theme={selectedThemeForDetails}
                />

                {/* Study Content Modal (New Comprehensive Version) */}
                <React.Suspense fallback={null}>
                    <StudyContentModal
                        isOpen={!!selectedSubthemeForNotes}
                        onClose={() => setSelectedSubthemeForNotes(null)}
                        subtheme={selectedSubthemeForNotes}
                        onSave={(content: string) => {
                            // 1. Save Content
                            updateSubthemeContent(selectedSubthemeForNotes.id, content);

                            // 2. Check for PENDING reviews due today or earlier
                            const todayStr = format(new Date(), 'yyyy-MM-dd');
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
            </div>
        </>
    );
};


