import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckSquare, Target, BookOpen, FileText, ChevronRight } from 'lucide-react';
import { useGlobalSearch, type SearchResult } from '../hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { useDebounce } from '../hooks/useOptimization';

// Lazy load modais pesados
const TaskDetailsModal = React.lazy(() => import('../features/tasks/components/TaskDetailsModal').then(m => ({ default: m.TaskDetailsModal })));
const GoalDetailsModal = React.lazy(() => import('../features/goals/components/GoalDetailsModal').then(m => ({ default: m.GoalDetailsModal })));
const ThemeDetailsModal = React.lazy(() => import('../features/themes/components/ThemeDetailsModal').then(m => ({ default: m.ThemeDetailsModal })));

import { useGlobalSearchController } from '../hooks/useGlobalSearchController';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}


export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const {
        query,
        setQuery,
        results,
        selectedIndex,
        inputRef,
        selectedTaskId,
        setSelectedTaskId,
        selectedGoalId,
        setSelectedGoalId,
        selectedThemeId,
        setSelectedThemeId,
        handleSelectResult
    } = useGlobalSearchController(isOpen, onClose);

    const { tasks, goals, themes } = useStudy();


    const getResultIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'task':
                return <CheckSquare className="w-5 h-5 text-purple-400" />;
            case 'goal':
                return <Target className="w-5 h-5 text-blue-400" />;
            case 'theme':
                return <BookOpen className="w-5 h-5 text-orange-400" />;
            case 'subtheme':
                return <FileText className="w-5 h-5 text-orange-300" />;
        }
    };

    const getResultBadge = (type: SearchResult['type']) => {
        const badges = {
            task: { label: 'Tarefa', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
            goal: { label: 'Meta', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
            theme: { label: 'Tema', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
            subtheme: { label: 'Subtema', color: 'bg-orange-500/20 text-orange-200 border-orange-500/20' }
        };

        const badge = badges[type];
        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Search Modal */}
                <div
                    role="dialog"
                    aria-label="Busca Global"
                    aria-modal="true"
                    className="relative w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
                        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                        <input
                            ref={inputRef}
                            type="text"
                            role="combobox"
                            aria-expanded={results.length > 0}
                            aria-controls="search-results-listbox"
                            aria-activedescendant={selectedIndex >= 0 && results[selectedIndex] ? `result-${results[selectedIndex].id}` : undefined}
                            aria-autocomplete="list"
                            aria-haspopup="listbox"
                            placeholder="Buscar em tarefas, metas, temas..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                        />
                        <button
                            onClick={onClose}
                            aria-label="Fechar busca"
                            className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {query.trim().length < 2 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
                                <p className="text-xs mt-2 opacity-70">Use ↑↓ para navegar, Enter para selecionar</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Nenhum resultado encontrado</p>
                                <p className="text-xs mt-2 opacity-70">Tente buscar por outro termo</p>
                            </div>
                        ) : (
                            <div className="p-2" role="listbox" id="search-results-listbox">
                                {results.map((result, index) => (
                                    <button
                                        key={result.id}
                                        id={`result-${result.id}`}
                                        role="option"
                                        aria-selected={index === selectedIndex}
                                        tabIndex={-1} // Focus stays on input
                                        onClick={() => handleSelectResult(result)}
                                        className={`
                                        w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left outline-none
                                        ${index === selectedIndex
                                                ? 'bg-slate-700/50 border border-slate-600/50'
                                                : 'hover:bg-slate-700/30 border border-transparent'
                                            }
                                    `}
                                    >
                                        {/* Icon */}
                                        <div className="mt-1" aria-hidden="true">
                                            {getResultIcon(result.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-medium truncate">
                                                    {result.title}
                                                </h3>
                                                {getResultBadge(result.type)}
                                            </div>

                                            {result.description && (
                                                <p className="text-sm text-slate-400 line-clamp-1">
                                                    {result.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                {result.parentTheme && (
                                                    <span>em {result.parentTheme}</span>
                                                )}
                                                {result.category && (
                                                    <span className="capitalize">{result.category}</span>
                                                )}
                                                {result.date && (
                                                    <span aria-label={`Data: ${new Date(result.date).toLocaleDateString('pt-BR')}`}>
                                                        {new Date(result.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow indicator */}
                                        {index === selectedIndex && (
                                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {results.length > 0 && (
                        <div className="px-4 py-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                            <span>{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</span>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400">↑↓</kbd>
                                    Navegar
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400">Enter</kbd>
                                    Abrir
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400">Esc</kbd>
                                    Fechar
                                </span>
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>


            {/* Modals */}
            <React.Suspense fallback={null}>
                <TaskDetailsModal
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                    task={tasks.find(t => t.id === selectedTaskId) || null}
                />
            </React.Suspense>

            <React.Suspense fallback={null}>
                <GoalDetailsModal
                    isOpen={!!selectedGoalId}
                    onClose={() => setSelectedGoalId(null)}
                    goal={goals.find(g => g.id === selectedGoalId) || null}
                />
            </React.Suspense>

            <React.Suspense fallback={null}>
                <ThemeDetailsModal
                    isOpen={!!selectedThemeId}
                    onClose={() => setSelectedThemeId(null)}
                    theme={themes.find(th => th.id === selectedThemeId) || null}
                />
            </React.Suspense>
        </>
    );
};
