import React from 'react';
import { X, Download } from 'lucide-react';

interface PWAPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
}

export const PWAPrompt: React.FC<PWAPromptProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 z-50">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-white" />
                    <h3 className="text-white font-bold">Instalar App</h3>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-white/90 text-sm mb-3">
                Instale o Study Panel para acesso rápido e funcionalidade offline!
            </p>

            <div className="flex gap-2">
                <button
                    onClick={onInstall}
                    className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                    Instalar
                </button>
                <button
                    onClick={onDismiss}
                    className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                    Agora não
                </button>
            </div>
        </div>
    );
};
