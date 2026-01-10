import React from 'react';
import type { Template } from '../../hooks/useTemplates';
import { Sparkles } from 'lucide-react';

interface TemplateCardProps {
    template: Template;
    onSelect: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
    const typeColors = {
        theme: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        task: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        goal: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        project: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };

    const typeLabels = {
        theme: 'Tema',
        task: 'Tarefa',
        goal: 'Meta',
        project: 'Projeto',
    };

    return (
        <button
            onClick={() => onSelect(template)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{template.icon}</div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeColors[template.type]}`}>
                    {typeLabels[template.type]}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-white font-bold text-sm mb-1 group-hover:text-blue-300 transition-colors">
                {template.name}
            </h3>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                {template.description}
            </p>

            {/* Category */}
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <Sparkles className="w-3 h-3" />
                <span>{template.category}</span>
            </div>
        </button>
    );
};
