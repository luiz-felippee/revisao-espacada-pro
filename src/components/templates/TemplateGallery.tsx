import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { X, Search, Sparkles } from 'lucide-react';
import { useTemplates, type Template } from '../../hooks/useTemplates';
import { TemplateCard } from './TemplateCard';

interface TemplateGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    type?: Template['type']; // Filter by type
    onSelectTemplate: (template: Template) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
    isOpen,
    onClose,
    type,
    onSelectTemplate,
}) => {
    const { allTemplates, getTemplatesByType, searchTemplates } = useTemplates();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<Template['type'] | 'all'>(type || 'all');

    // Get filtered templates
    const filteredTemplates = React.useMemo(() => {
        let templates = selectedType === 'all' ? allTemplates : getTemplatesByType(selectedType);

        if (searchQuery) {
            templates = searchTemplates(searchQuery);
            if (selectedType !== 'all') {
                templates = templates.filter(t => t.type === selectedType);
            }
        }

        return templates;
    }, [selectedType, searchQuery, allTemplates, getTemplatesByType, searchTemplates]);

    const handleSelectTemplate = (template: Template) => {
        onSelectTemplate(template);
        onClose();
        setSearchQuery('');
    };

    const typeFilters: Array<{ value: Template['type'] | 'all'; label: string }> = [
        { value: 'all', label: 'Todos' },
        { value: 'theme', label: 'Temas' },
        { value: 'project', label: 'Projetos' },
        { value: 'task', label: 'Tarefas' },
        { value: 'goal', label: 'Metas' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Galeria de Templates</h2>
                            <p className="text-slate-400 text-sm">Crie rapidamente a partir de modelos prontos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar templates..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {/* Type Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {typeFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedType(filter.value)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedType === filter.value
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                {filteredTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400">
                            {searchQuery ? 'Nenhum template encontrado' : 'Nenhum template disponível'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={handleSelectTemplate}
                            />
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                {filteredTemplates.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-xs text-slate-500 text-center">
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} disponível{filteredTemplates.length !== 1 ? 'is' : ''}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
