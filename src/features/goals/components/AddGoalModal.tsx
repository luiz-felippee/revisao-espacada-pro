import React from 'react';
import { Target, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ImageUpload } from '../../../components/forms/ImageUpload';
import { ColorPicker } from '../../../components/forms/ColorPicker';
import { PrioritySelector } from '../../../components/forms/PrioritySelector';
import { DurationStepper } from '../../../components/forms/DurationStepper';
import { SymbolPicker } from '../../../components/forms/SymbolPicker';
import type { Goal } from '../../../types';
import { cn } from '../../../lib/utils';

import { useGoalFormLogic } from '../hooks/useGoalFormLogic';
import { GoalTypeSelector } from './GoalTypeSelector';
import { ChecklistBuilder } from './ChecklistBuilder';
import { ScheduleFields } from './ScheduleFields';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: Goal;
    defaultThemeId?: string;
    defaultType?: 'simple' | 'checklist' | 'habit';
}

export const AddGoalModal: React.FC<AddGoalModalProps> = (props) => {
    const {
        title, setTitle,
        type, setType,
        category, setCategory,
        priority, setPriority,
        relatedThemeId, setRelatedThemeId,
        startDate, setStartDate,
        deadline, setDeadline,
        recurrence, setRecurrence,
        icon, setIcon,
        color, setColor,
        imageUrl, setImageUrl,
        duration, setDuration,
        checklist, setChecklist,
        errors, setErrors,
        usedColors,
        themes,
        handleSubmit,
        handleDelete,
        recalculateSchedule
    } = useGoalFormLogic(props);

    const { isOpen, onClose, goalToEdit, defaultThemeId } = props;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg" padding={false} scrollContent={false} className="h-[85vh]">
            <div className="relative h-full flex flex-col bg-slate-950 font-sans overflow-hidden">
                {/* Background Ambiance */}
                <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full overflow-hidden">

                    {/* 1. Header (Fixed via Flex-None) */}
                    <div className="flex-none bg-slate-950/90 backdrop-blur-xl border-b border-white/5 p-4 sm:p-6 pb-4 space-y-4 z-20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    {goalToEdit ? "Editar Meta" : "Nova Meta"}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Transforme seus sonhos em objetivos claros.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                                <span className="text-2xl drop-shadow-md">🎯</span>
                            </div>
                        </div>

                        {/* Title Input Highlight */}
                        <div className="relative pt-2">
                            <input
                                placeholder="Digite o nome da meta..."
                                value={title}
                                onChange={e => {
                                    setTitle(e.target.value);
                                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                                }}
                                autoFocus
                                className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 border-none outline-none focus:ring-0 px-0 py-2 transition-colors"
                            />
                            <div className={`h-0.5 w-full rounded-full transition-colors duration-300 ${errors.title ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50'}`} />
                            {errors.title && (
                                <span className="text-red-400 text-xs font-bold mt-1 block animate-in slide-in-from-top-1">
                                    {errors.title}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 2. Scrollable Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-8 z-10">
                        <GoalTypeSelector type={type} onChange={setType} />

                        {/* Checklist Builder (if active) */}
                        {type === 'checklist' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <ChecklistBuilder
                                    checklist={checklist}
                                    onChange={setChecklist}
                                    startDate={startDate}
                                    recalculateSchedule={recalculateSchedule}
                                    setDeadline={setDeadline}
                                />
                            </div>
                        )}

                        {/* Settings Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-5 shadow-sm backdrop-blur-sm">

                            {/* Cronograma */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                                    <Target className="w-3 h-3" /> Cronograma
                                </div>
                                <div className="relative">
                                    <ScheduleFields
                                        type={type}
                                        startDate={startDate}
                                        deadline={deadline}
                                        recurrence={recurrence}
                                        onStartDateChange={d => { setStartDate(d); if (errors.startDate) setErrors(p => ({ ...p, startDate: '' })) }}
                                        onDeadlineChange={d => { setDeadline(d); if (errors.deadline) setErrors(p => ({ ...p, deadline: '' })) }}
                                        onRecurrenceChange={setRecurrence}
                                    />
                                    {(errors.startDate || errors.deadline) && (
                                        <div className="flex justify-between px-1 mt-1.5">
                                            <span className="text-red-400 text-[10px] font-bold">{errors.startDate}</span>
                                            <span className="text-red-400 text-[10px] font-bold">{errors.deadline}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-white/5 w-full" />

                            {/* Detalhes Técnicos */}
                            <div className="space-y-4">
                                {/* Header - Mobile: Stacked, Desktop: Side by side */}
                                <div className="border-b border-white/5 pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                            <Target className="w-3 h-3" /> Classificação
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Prioridade</span>
                                            <div className="w-full sm:w-[200px]">
                                                <PrioritySelector value={priority} onChange={setPriority} label="" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Categoria</label>
                                        <Input
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            placeholder="Ex: Saúde"
                                            className="bg-slate-950/60 border-white/5 h-10 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Duração (Min)</label>
                                        <div className="bg-slate-950/60 rounded-lg border border-white/5 p-1 h-10 flex items-center">
                                            <DurationStepper value={duration} onChange={setDuration} step={5} min={0} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Tema Vinculado</label>
                                        <select
                                            value={relatedThemeId}
                                            onChange={e => setRelatedThemeId(e.target.value)}
                                            disabled={!!defaultThemeId && !goalToEdit}
                                            className={`w-full bg-slate-950/60 border border-white/5 h-10 rounded-lg text-xs px-3 outline-none focus:border-blue-500/50 text-slate-300 transition-colors ${!!defaultThemeId && !goalToEdit ? 'opacity-60 cursor-not-allowed font-bold text-blue-400' : ''}`}
                                        >
                                            <option value="">Sem vínculo</option>
                                            {themes.map(t => (
                                                <option key={t.id} value={t.id}>{t.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Personalization */}
                        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-4">
                            <div className="flex items-start gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <ColorPicker value={color} onChange={setColor} disabledColors={goalToEdit ? usedColors.filter(c => c !== goalToEdit!.color) : usedColors} label="Cor do Card" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-300 block mb-2">Ícone</label>
                                            <SymbolPicker value={icon} onChange={setIcon} placeholder="🎯" />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <ImageUpload label="Imagem de Capa (Opcional)" value={imageUrl} onChange={setImageUrl} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Footer (Fixed Layout) */}
                    <div className="flex-none p-4 sm:p-6 pt-4 bg-slate-950 border-t border-white/5 flex items-center justify-between gap-3 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] z-20">
                        {goalToEdit && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Excluir</span>
                            </button>
                        )}
                        <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-slate-400 hover:text-white flex-1 sm:flex-none"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 flex-1 sm:flex-none h-11 sm:h-auto px-6 font-bold tracking-wide"
                            >
                                {goalToEdit ? "Salvar Alterações" : "Criar Meta"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div >
        </Modal >
    );
};

export default AddGoalModal;
