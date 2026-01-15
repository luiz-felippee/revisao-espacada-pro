import React, { useState } from 'react';
import type { Project } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { X, Plus, Calendar } from 'lucide-react';
import { useProjectContext } from '../../../context/ProjectProvider';
import { SymbolPicker } from '../../../components/forms/SymbolPicker';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose }) => {
    const { addProject } = useProjectContext();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Project['category']>('personal');
    const [status, setStatus] = useState<Project['status']>('planning');
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');
    const [icon, setIcon] = useState('📁');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        addProject({
            title: title.trim(),
            description: description.trim() || undefined,
            category,
            status,
            startDate: startDate || undefined,
            deadline: deadline || undefined,
            icon,
            linkedTaskIds: [],
            linkedGoalIds: [],
        });

        // Reset form
        setTitle('');
        setDescription('');
        setCategory('personal');
        setStatus('planning');
        setStartDate('');
        setDeadline('');
        setIcon('📁');

        onClose();
    };

    const categoryOptions = [
        { value: 'professional', label: 'Profissional', icon: '💼' },
        { value: 'personal', label: 'Pessoal', icon: '🏠' },
        { value: 'academic', label: 'Acadêmico', icon: '🎓' },
    ] as const;

    const statusOptions = [
        { value: 'planning', label: 'Planejando' },
        { value: 'active', label: 'Ativo' },
        { value: 'paused', label: 'Pausado' },
        { value: 'completed', label: 'Concluído' },
    ] as const;

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
            <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Novo Projeto</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* Icon & Title */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                        <div className="w-full md:w-[120px] flex-shrink-0">
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Ícone
                            </label>
                            <SymbolPicker
                                value={icon}
                                onChange={setIcon}
                                placeholder="📁"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Nome do Projeto
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: App de Finanças"
                                className="w-full h-11 md:h-[40px] bg-slate-900/50 border border-slate-700 rounded-lg px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all text-sm md:text-base"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição (opcional)"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none text-sm md:text-base min-h-[80px]"
                            rows={3}
                        />
                    </div>

                    {/* Category & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Categoria
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {categoryOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setCategory(opt.value)}
                                        className={`p-2 rounded-lg transition-all flex flex-col items-center justify-center gap-1 min-h-[60px] ${category === opt.value
                                            ? 'bg-blue-500 text-white ring-2 ring-blue-500/30'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                                            }`}
                                    >
                                        <span className="text-xl md:text-lg">{opt.icon}</span>
                                        <span className="text-[10px] md:text-xs font-medium truncate w-full text-center">
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Status Inicial
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Project['status'])}
                                    className="w-full h-[60px] md:h-auto md:py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg px-3 text-white focus:border-blue-500 focus:outline-none appearance-none text-sm md:text-base"
                                >
                                    {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Data de Início
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-11 md:h-10 bg-slate-900/50 border border-slate-700 rounded-lg px-3 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 md:mb-2 ml-1">
                                Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full h-11 md:h-10 bg-slate-900/50 border border-slate-700 rounded-lg px-3 text-white focus:border-blue-500 focus:outline-none text-sm md:text-base"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 md:pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="md:flex-1 h-12 md:h-10 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex-[2] h-12 md:h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                        >
                            <Plus className="w-5 h-5 md:w-4 md:h-4" />
                            Criar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
