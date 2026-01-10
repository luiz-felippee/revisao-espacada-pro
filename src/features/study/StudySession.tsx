import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Flashcard } from './components/Flashcard';
import { StudyControls } from './components/StudyControls';
import { ChevronLeft, Loader2, Award } from 'lucide-react';

interface StudySessionProps {
    subthemeId: string;
    onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ subthemeId, onExit }) => {
    const { themes, completeReview } = useStudy();

    // State
    const [isFlipped, setIsFlipped] = useState(false);
    const [subtheme, setSubtheme] = useState<any>(null);
    const [themeColor, setThemeColor] = useState('#3b82f6');
    const [isCompleted, setIsCompleted] = useState(false);

    // Load Subtheme
    useEffect(() => {
        if (!subthemeId || themes.length === 0) return;

        // Find subs in themes
        let found = null;
        let color = '#3b82f6';

        for (const t of themes) {
            const s = t.subthemes.find(sub => sub.id === subthemeId);
            if (s) {
                found = s;
                color = t.color || '#3b82f6';
                break;
            }
        }

        if (found) {
            setSubtheme(found);
            setThemeColor(color);
        }
    }, [subthemeId, themes]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleGrade = async (grade: 'bad' | 'hard' | 'good' | 'easy') => {
        if (!subtheme) return;

        // In future: pass grade to algorithm
        await completeReview(subtheme.id, subtheme.reviews, 'review');

        setIsCompleted(true);
        // Delay to exit
        setTimeout(() => {
            onExit();
        }, 1500);
    };

    if (!subtheme) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 animate-in fade-in duration-500 relative z-50">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/10 animate-bounce">
                    <Award className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Excelente!</h2>
                <p className="text-slate-400">Revisão concluída com sucesso.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex flex-col h-screen bg-slate-950 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Zen Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
            <div
                className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: themeColor }}
            />

            {/* Header */}
            <header className="flex items-center justify-between p-6 relative z-10">
                <button
                    onClick={onExit}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revisão</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Main Stage */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pb-20">
                <Flashcard
                    frontContent={subtheme.title}
                    backContent={subtheme.text_content || "Sem descrição disponível para estudo."}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                />
            </main>

            {/* Controls */}
            <footer className="fixed bottom-0 w-full p-8 pb-12 flex justify-center bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <StudyControls
                        isVisible={isFlipped}
                        onGrade={handleGrade}
                    />
                </div>
            </footer>
        </div>
    );
};
