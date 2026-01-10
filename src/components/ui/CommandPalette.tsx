import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
// MainLayout uses props for navigation, so no router hook needed here. 
// Actually MainLayout passes onTabChange. The palette needs access to these contexts.
// To keep it clean, maybe we pass actions as props or use context? 
// Re-reading MainLayout: it uses props for onTabChange. 
// So CommandPalette should probably accept an `onAction` callback or the individual handlers.
// Let's make it accept `onNavigate` and specific action handlers.

interface CommandAction {
    id: string;
    label: string;
    icon: React.ElementType;
    shortcut?: string[]; // e.g. ["G", "D"]
    category: 'Navigation' | 'Action' | 'System';
    keywords?: string; // extra keywords for search
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    actions: CommandAction[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Simplified CommandPalette - query/selection managed by trigger or internal reset logic
    // Removing synchronous reset inside useEffect[isOpen]

    // Filter commands
    const filteredActions = useMemo(() => {
        if (!query) return actions;
        const lowerQuery = query.toLowerCase();
        return actions.filter(action =>
            action.label.toLowerCase().includes(lowerQuery) ||
            action.category.toLowerCase().includes(lowerQuery) ||
            action.keywords?.toLowerCase().includes(lowerQuery)
        );
    }, [query, actions]);

    // Keyboard Navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    filteredActions[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredActions, selectedIndex, onClose]);

    if (!isOpen) return null;

    // Group for display
    const groups = {
        Navigation: filteredActions.filter(a => a.category === 'Navigation'),
        Action: filteredActions.filter(a => a.category === 'Action'),
        System: filteredActions.filter(a => a.category === 'System'),
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">

                {/* Search Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-slate-900/50">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="O que você precisa?"
                        className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 font-medium"
                        autoFocus
                    />
                    <kbd className="hidden md:flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        <span className="text-xs">ESC</span>
                    </kbd>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar p-2 space-y-4">
                    {filteredActions.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm">
                            Nenhum comando encontrado.
                        </div>
                    ) : (
                        (['Navigation', 'Action', 'System'] as const).map(category => {
                            const categoryActions = groups[category];
                            if (categoryActions.length === 0) return null;

                            return (
                                <div key={category}>
                                    <h3 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        {category === 'Navigation' ? 'Ir para...' : category === 'Action' ? 'Ações' : 'Sistema'}
                                    </h3>
                                    <div className="space-y-0.5">
                                        {categoryActions.map((action) => {
                                            const globalIndex = filteredActions.indexOf(action);
                                            const isSelected = globalIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={() => {
                                                        action.action();
                                                        onClose();
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-100 group",
                                                        isSelected
                                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <action.icon className={cn(
                                                            "w-4 h-4",
                                                            isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                                        )} />
                                                        <span className="font-medium">{action.label}</span>
                                                    </div>

                                                    {action.category === 'Action' && isSelected && (
                                                        <ChevronRight className="w-3.5 h-3.5 text-white/50 animate-pulse" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2 bg-slate-950/30 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 rotate-90" />
                            <ChevronRight className="w-3 h-3 -rotate-90" />
                            Navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="bg-white/10 px-1 rounded">↵</span>
                            Selecionar
                        </span>
                    </div>
                    <span>Revisão Espaçada PRO</span>
                </div>
            </div>
        </div>
    );
};
