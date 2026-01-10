import React, { useState } from 'react';
import { cn } from '../../../lib/utils'; // Assuming global utils path
import DOMPurify from 'dompurify';

interface FlashcardProps {
    frontContent: string;
    backContent: string;
    isFlipped: boolean;
    onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ frontContent, backContent, isFlipped, onFlip }) => {
    return (
        <div
            className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer group"
            onClick={onFlip}
        >
            <div className={cn(
                "relative w-full h-full transition-all duration-500 transform-style-3d",
                isFlipped ? "rotate-y-180" : ""
            )}>
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden">
                    <div className="w-full h-full bg-slate-900 border-2 border-slate-700/50 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl hover:border-slate-600 transition-colors">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Pergunta</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-100 leading-tight">
                            {frontContent}
                        </h2>
                        <span className="absolute bottom-8 text-xs text-slate-600 animate-pulse">Toque para virar</span>
                    </div>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-slate-900 border-2 border-blue-500/30 rounded-3xl flex flex-col items-center justify-center p-8 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <span className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Resposta</span>
                        <div
                            className="text-xl md:text-2xl text-center text-slate-200 leading-relaxed overflow-y-auto max-h-full custom-scrollbar prose prose-invert"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(backContent) }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
