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
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Novo Projeto</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Icon & Title */}
                    <div className="flex gap-3">
                        <div className="w-[120px] flex-shrink-0">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Ícone
                            </label>
                            <SymbolPicker
                                value={icon}
                                onChange={setIcon}
                                placeholder="📁"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Nome do Projeto
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: App de Finanças"
                                className="w-full h-[40px] bg-slate-900/50 border border-slate-700 rounded-lg px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descrição (opcional)"
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                        rows={3}
                    />

                    {/* Category & Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Categoria
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {categoryOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setCategory(opt.value)}
                                        className={`p-2 rounded-lg text-xs font-medium transition-all ${category === opt.value
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{opt.icon}</div>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Status Inicial
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Project['status'])}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Data de Início
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Criar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
