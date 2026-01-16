import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useStudy } from '../../context/StudyContext';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { DaySelector } from '../../components/forms/DaySelector';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { ColorPicker } from '../../components/forms/ColorPicker';
import { PrioritySelector } from '../../components/forms/PrioritySelector';
import { DurationStepper } from '../../components/forms/DurationStepper';
import { DatePicker } from '../../components/ui/DatePicker';
import { SymbolPicker } from '../../components/forms/SymbolPicker';
import { cn } from '../../lib/utils';
import type { Task } from '../../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task; // Optional prop for edit mode
}

const taskSchema = z.object({
    title: z.string().min(3, 'O nome da missão deve ter pelo menos 3 caracteres'),
    type: z.enum(['day', 'period', 'recurring', 'goal']),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    recurrence: z.array(z.number()).optional()
}).refine(data => {
    if (data.type === 'day') return !!data.date;
    if (data.type === 'period' || data.type === 'goal') return !!data.startDate;
    return true;
}, {
    message: "Data é obrigatória para este tipo de missão",
    path: ["date"]
});

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
    const { addTask, updateTask, themes, tasks, goals, addGoal } = useStudy();

    const usedColors = [
        ...themes.map(t => t.color),
        ...tasks.map(t => t.color),
        ...goals.map(g => g.color)
    ].filter(Boolean) as string[];

    // Initialize state properly when modal opens/changes
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [priority, setPriority] = useState(taskToEdit?.priority || 'medium');
    const [type, setType] = useState(taskToEdit?.type || 'day');
    const [date, setDate] = useState(taskToEdit?.date || format(new Date(), 'yyyy-MM-dd'));
    const [startDate, setStartDate] = useState(taskToEdit?.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(taskToEdit?.endDate || '');
    const [recurrence, setRecurrence] = useState<number[]>(taskToEdit?.recurrence || []);
    const [icon, setIcon] = useState(taskToEdit?.icon || '');
    const [color, setColor] = useState(taskToEdit?.color || '');
    const [imageUrl, setImageUrl] = useState(taskToEdit?.imageUrl || '');
    const [duration, setDuration] = useState(taskToEdit?.durationMinutes?.toString() || '25');

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset or Set values when taskToEdit changes
    React.useEffect(() => {
        if (isOpen) {
            setErrors({}); // Reset errors
            setTitle(taskToEdit?.title || '');
            setPriority(taskToEdit?.priority || 'medium');
            setType(taskToEdit?.type || 'day');
            setDate(taskToEdit?.date || format(new Date(), 'yyyy-MM-dd'));
            setStartDate(taskToEdit?.startDate || format(new Date(), 'yyyy-MM-dd'));
            setEndDate(taskToEdit?.endDate || '');
            setRecurrence(taskToEdit?.recurrence || []);
            setIcon(taskToEdit?.icon || '');
            setColor(taskToEdit?.color || '');
            setImageUrl(taskToEdit?.imageUrl || '');
            setDuration(taskToEdit?.durationMinutes?.toString() || '25');
        }
    }, [isOpen, taskToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate
        const result = taskSchema.safeParse({
            title,
            type,
            date,
            startDate,
            endDate,
            recurrence
        });

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                const path = err.path[0];
                if (path) newErrors[path.toString()] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        if (!title) return;

        const taskData = {
            title,
            status: taskToEdit?.status || 'pending',
            priority: priority as any,
            type: type as any,
            date: type === 'day' ? date : undefined,
            startDate: type === 'period' ? startDate : undefined,
            endDate: (type === 'period' || type === 'recurring') ? endDate : undefined,
            recurrence: type === 'recurring' ? recurrence : undefined,
            icon: icon || undefined,
            color: color || undefined,
            imageUrl: imageUrl || undefined,
            durationMinutes: duration ? parseInt(duration) : undefined
        };

        if (taskToEdit) {
            updateTask(taskToEdit.id, taskData);
        } else {
            if ((type as any) === 'goal') {
                const goalData = {
                    title,
                    type: 'simple',
                    category: 'Geral', // Default category
                    priority: priority as any,
                    startDate: startDate || format(new Date(), 'yyyy-MM-dd'),
                    deadline: endDate || format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
                    icon: icon || undefined,
                    color: color || undefined,
                    imageUrl: imageUrl || undefined,
                    durationMinutes: duration ? parseInt(duration) : undefined
                };
                addGoal(goalData as any);
            } else {
                addTask(taskData as any);
            }
        }

        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg" padding={false} scrollContent={false} className="h-[85vh]">
            <div className="relative h-full flex flex-col bg-slate-950 font-sans overflow-hidden">
                {/* Background Ambiance */}
                <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full overflow-hidden">

                    {/* 1. Header (Fixed Layout) */}
                    <div className="flex-none bg-slate-950/90 backdrop-blur-xl border-b border-white/5 p-6 pb-4 space-y-4 z-20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    {taskToEdit ? "Editar Missão" : "Nova Missão"}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Defina seu próximo objetivo ou tarefa.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                                <span className="text-2xl drop-shadow-md">✨</span>
                            </div>
                        </div>

                        {/* Title Input Highlight */}
                        <div className="relative pt-2">
                            <input
                                placeholder="Digite o nome da missão..."
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
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 z-10">

                        {/* Frequency Tab Selector */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                            {[
                                { value: 'day', label: 'Hoje', icon: '⚡' },
                                { value: 'period', label: 'Ciclo', icon: '⏳' },
                                { value: 'recurring', label: 'Rotina', icon: '🔄' },
                                { value: 'goal', label: 'Meta', icon: '🎯' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        const todayStr = format(new Date(), 'yyyy-MM-dd');
                                        setType(opt.value as any);
                                        if (opt.value === 'day') setDate(todayStr);
                                        if (opt.value === 'period' || opt.value === 'goal') setStartDate(todayStr);
                                    }}
                                    className={cn(
                                        "py-2 px-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",
                                        type === opt.value
                                            ? "bg-blue-600 shadow-md text-white"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    )}
                                >
                                    <span className="text-sm">{opt.icon}</span>
                                    <span className="hidden sm:inline">{opt.label}</span>
                                    <span className="sm:hidden">{opt.label.slice(0, 3)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Settings Card */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-5 shadow-sm">

                            {/* Dates Section */}
                            <div className="space-y-3">
                                <label className="text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    📅 Planejamento Temporal
                                </label>

                                {/* Dynamic Date Inputs */}
                                <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5">
                                    {type === 'day' && (
                                        <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Data de Execução</label>
                                            <DatePicker value={date} onChange={setDate} className="w-full" />
                                        </div>
                                    )}
                                    {(type === 'period' || (type as any) === 'goal') && (
                                        <div className="animate-in fade-in zoom-in-95 duration-200 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Início</label>
                                                <DatePicker value={startDate} onChange={setStartDate} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">{(type as any) === 'goal' ? 'Prazo Final' : 'Conclusão'}</label>
                                                <DatePicker value={endDate} onChange={setEndDate} />
                                            </div>
                                        </div>
                                    )}
                                    {type === 'recurring' && (
                                        <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                                            <DaySelector selectedDays={recurrence} onChange={setRecurrence} />
                                            <div className="space-y-1 border-t border-white/5 pt-3">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Válido Até (Opcional)</label>
                                                <DatePicker value={endDate} onChange={setEndDate} placeholder="Sem data final" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Deadlines */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar justify-start sm:justify-center pt-2">
                                    {([
                                        // Options updated: 1 Month -> 1 Year
                                        { label: '+1 Mês', months: 1 },
                                        { label: '+3 Meses', months: 3 },
                                        { label: '+6 Meses', months: 6 },
                                        { label: '+1 Ano', years: 1 },
                                    ] as { label: string; days?: number; months?: number; years?: number; }[]).map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => {
                                                const base = new Date();
                                                let target = base;
                                                if (opt.days) target = addDays(base, opt.days);
                                                if (opt.months) target = addMonths(base, opt.months);
                                                if (opt.years) target = addYears(base, opt.years);

                                                const fmt = format(target, 'yyyy-MM-dd');
                                                if (type === 'day') setDate(fmt);
                                                else setEndDate(fmt);
                                            }}
                                            className="h-6 px-2.5 rounded-md bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border border-white/5 text-[10px] font-bold text-slate-400 transition-colors whitespace-nowrap"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-white/5 w-full" />

                            {/* Classificação: Duration & Priority */}
                            <div className="space-y-4 pt-2">
                                {/* Header - Mobile: Stacked, Desktop: Side by side */}
                                <div className="border-b border-white/5 pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
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

                                <div className="space-y-1.5 flex flex-col max-w-[200px]">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Duração (Min)</label>
                                    <div className="bg-slate-950/60 rounded-lg border border-white/5 p-1 h-10 flex items-center">
                                        <DurationStepper value={duration} onChange={setDuration} step={5} min={0} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personalization Section */}
                        <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <ColorPicker value={color} onChange={setColor} disabledColors={taskToEdit ? usedColors.filter(c => c !== taskToEdit!.color) : usedColors} label="Cor do Card" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-300 block mb-2">Ícone</label>
                                            <SymbolPicker value={icon} onChange={setIcon} placeholder="✨" />
                                        </div>
                                    </div>
                                    <ImageUpload label="Imagem de Capa (Opcional)" value={imageUrl} onChange={setImageUrl} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Footer (Fixed Layout) */}
                    <div className="flex-none p-6 pt-4 bg-slate-950 border-t border-white/5 flex items-center justify-between gap-3 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] z-20">
                        {taskToEdit && (
                            <button
                                type="button"
                                className="hidden"
                            />
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
                                {taskToEdit ? "Salvar Alterações" : "Criar Missão"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
