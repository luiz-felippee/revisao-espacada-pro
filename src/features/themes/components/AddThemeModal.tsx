import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useStudy } from '../../../context/StudyContext';
import { Plus, Trash2, ArrowDownUp } from 'lucide-react';
import { ImageUpload } from '../../../components/forms/ImageUpload';
import { ColorPicker } from '../../../components/forms/ColorPicker';
import { PrioritySelector } from '../../../components/forms/PrioritySelector';
import { DurationStepper } from '../../../components/forms/DurationStepper';
import { DatePicker } from '../../../components/ui/DatePicker';
import { SymbolPicker } from '../../../components/forms/SymbolPicker';
import { cn } from '../../../lib/utils';
import type { Theme } from '../../../types';

interface AddThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    themeToEdit?: Theme;
    defaultCategory?: 'study' | 'project'; // NEW
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'module';

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
    beginner: 2,
    intermediate: 3,
    advanced: 4,
    module: 1
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
    beginner: 'text-emerald-400',
    intermediate: 'text-amber-400',
    advanced: 'text-rose-400',
    module: 'text-slate-400 font-bold'
};

const themeSchema = z.object({
    title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
    startDate: z.string().min(1, 'A data de início é obrigatória'),
    subthemes: z.array(z.object({
        title: z.string().optional(), // Allow empty, filtering later
        duration: z.string(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'module'])
    }))
});

export const AddThemeModal: React.FC<AddThemeModalProps> = ({ isOpen, onClose, themeToEdit, defaultCategory = 'study' }) => {
    const { addTheme, updateTheme, deleteTheme, tasks, goals, themes } = useStudy();

    // Calculate globally used colors to prevent duplicates in calendar
    const usedColors = [
        ...themes.map(t => t.color),
        ...tasks.map(t => t.color),
        ...goals.map(g => g.color)
    ].filter(Boolean) as string[];

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');

    const [subthemes, setSubthemes] = useState<{ title: string; duration: string; difficulty: Difficulty }[]>([
        { title: '', duration: '25', difficulty: 'beginner' }
    ]);

    const [icon, setIcon] = useState('');
    const [color, setColor] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(themeToEdit?.priority || 'medium');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [notificationTime, setNotificationTime] = useState(''); // NEW
    const [category, setCategory] = useState<'study' | 'project'>(themeToEdit?.category || defaultCategory); // State for category

    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initial State Reset
    useEffect(() => {
        if (isOpen) {
            setErrors({}); // Clear errors on open
            if (themeToEdit) {
                // If editing, likely want to see details
                setIsAdvancedMode(true);
                setTitle(themeToEdit.title);
                setSubtitle((themeToEdit as any).subtitle || '');
                setSubthemes(themeToEdit.subthemes.map(s => ({
                    title: s.title,
                    duration: s.durationMinutes?.toString() || '25',
                    difficulty: (s as any).difficulty || 'beginner'
                } as any)));
                setIcon(themeToEdit.icon || '');
                setColor(themeToEdit.color || '');
                setImageUrl(themeToEdit.imageUrl || '');
                setPriority(themeToEdit.priority || 'medium');
                setStartDate(themeToEdit.startDate || format(new Date(), 'yyyy-MM-dd'));
                setCategory(themeToEdit.category || 'study'); // Fallback to 'study' if undefined
                setNotificationTime(themeToEdit.notificationTime || ''); // Set Notification Time
            } else {
                // New Theme -> Simple Mode by default
                setIsAdvancedMode(false);
                setTitle('');
                setSubtitle('');
                setSubthemes([
                    { title: '', duration: '25', difficulty: 'beginner' }
                ]);
                setIcon('');
                setColor('');
                setImageUrl('');
                setPriority('medium');
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
                setCategory(defaultCategory); // Use default prop
                setNotificationTime(''); // Reset Notification Time
            }
        }
    }, [isOpen, themeToEdit, defaultCategory]);

    const handleAddSubtheme = () => {
        const lastItem = subthemes.length > 0 ? subthemes[subthemes.length - 1] : null;
        const lastDifficulty = lastItem ? lastItem.difficulty : 'beginner';
        const lastDuration = lastItem ? lastItem.duration : '25'; // Inherit duration
        setSubthemes([...subthemes, { title: '', duration: lastDuration, difficulty: lastDifficulty }]);
    };

    const handleRemoveSubtheme = (index: number) => {
        setSubthemes(subthemes.filter((_, i) => i !== index));
    };

    const handleChangeSubtheme = (index: number, field: 'title' | 'duration' | 'difficulty', value: string) => {
        const newSubthemes = [...subthemes];
        newSubthemes[index] = { ...newSubthemes[index], [field]: value };
        setSubthemes(newSubthemes);
    };

    const autoSortSubthemes = () => {
        const sorted = [...subthemes].sort((a, b) => {
            const diffA = DIFFICULTY_ORDER[a.difficulty];
            const diffB = DIFFICULTY_ORDER[b.difficulty];
            return diffA - diffB;
        });
        setSubthemes(sorted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({});

        const validSubthemes = subthemes.filter(s => s.title.trim());

        // Validate with Zod
        const result = themeSchema.safeParse({
            title,
            startDate,
            subthemes
        });

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(newErrors);
            return;
        }

        // Custom Logic: Title is required (covered by Zod) but double check logic flow
        if (!title.trim()) {
            setErrors(prev => ({ ...prev, title: 'O título é obrigatório' }));
            return;
        }

        const formattedSubthemes = validSubthemes.map(s => ({
            title: s.title,
            duration: s.duration ? parseInt(s.duration) : undefined,
            difficulty: s.difficulty as Difficulty
        }));

        // Assign Random Color if not set
        const finalColor = color || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)];
        // Default Icon if not set
        const finalIcon = icon || '📚';

        const themeData = {
            title,
            subtitle,
            icon: finalIcon,
            imageUrl: imageUrl || undefined,
            color: finalColor,
            priority,
            startDate,
            category, // Add category to data
            notificationTime // Include notificationTime
        };

        if (themeToEdit) {
            updateTheme(themeToEdit.id, themeData);
        } else {
            (addTheme as any)(
                title,
                formattedSubthemes,
                {
                    icon: finalIcon,
                    imageUrl: imageUrl || undefined,
                    color: finalColor,
                    priority,
                    startDate,
                    subtitle,
                    category, // Pass category explicitly
                    notificationTime
                }
            );
        }

        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="xl">
            <div className="relative overflow-hidden p-5 sm:p-6">
                {/* Subtle Background Ambiance */}
                <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 font-sans">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-slate-800/50 flex items-center justify-center shadow-inner">
                                <span className="text-xl">📚</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                                    {themeToEdit ? "Editar Tema" : "Novo Tema"}
                                </h2>
                                <p className="text-[11px] text-slate-500 font-medium px-0.5">Organize seus estudos</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 px-6">
                        {/* Main Inputs (Always Visible) */}
                        <div className="space-y-3">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition duration-500" />
                                <input
                                    placeholder="Nome do Tema (Ex: React Native)..."
                                    value={title}
                                    onChange={e => {
                                        setTitle(e.target.value);
                                        if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                                    }}
                                    autoFocus
                                    className={cn(
                                        "relative w-full bg-slate-950/80 text-white placeholder-slate-600 border rounded-xl px-4 py-3 text-base font-medium focus:ring-1 transition-all shadow-sm",
                                        errors.title
                                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                            : "border-slate-800/50 focus:ring-blue-500/50 focus:border-blue-500/50"
                                    )}
                                />
                                {errors.title && (
                                    <span className="text-red-400 text-[10px] font-bold absolute -bottom-4 left-1 animate-in slide-in-from-top-1">
                                        {errors.title}
                                    </span>
                                )}
                            </div>

                            {/* Simple Mode Toggle hint or subtitle input in expanded */}
                            {isAdvancedMode && (
                                <Input
                                    placeholder="Subtítulo ou descrição breve..."
                                    value={subtitle}
                                    onChange={e => setSubtitle(e.target.value)}
                                    className="bg-slate-950/50 border-slate-800/50 text-sm h-10 animate-in fade-in slide-in-from-top-1"
                                />
                            )}
                        </div>

                        {/* Advanced Sections Toggle */}
                        {!isAdvancedMode && !themeToEdit && (
                            <button
                                type="button"
                                onClick={() => setIsAdvancedMode(true)}
                                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors group"
                            >
                                <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                Adicionar Detalhes (Capa, Ícone, Trilha)
                            </button>
                        )}


                        {/* Details Container (Collapsible) */}
                        {isAdvancedMode && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="bg-slate-900/40 rounded-xl border border-slate-800/50 p-4 space-y-4">

                                    {/* Classificação Section */}
                                    <div className="space-y-4">
                                        {/* Header - Mobile: Stacked, Desktop: Side by side */}
                                        <div className="border-b border-white/5 pb-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                                    <Plus className="w-3 h-3" /> Classificação
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
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Tipo de Registro</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value as 'study' | 'project')}
                                                    className="w-full h-10 bg-slate-950/60 border border-white/5 rounded-lg text-xs px-3 focus:border-blue-500/50 outline-none transition-all text-slate-300"
                                                >
                                                    <option value="study">Tema de Estudo</option>
                                                    <option value="project">Projeto / Trabalho</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Horário (Notificação)</label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={notificationTime}
                                                        onChange={(e) => setNotificationTime(e.target.value)}
                                                        className="w-full h-10 bg-slate-950/60 border border-white/5 rounded-lg text-xs px-3 focus:border-blue-500/50 outline-none transition-all text-white placeholder-slate-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 sm:col-span-2">
                                                <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Início da Trilha</label>
                                                <DatePicker
                                                    value={startDate}
                                                    onChange={setStartDate}
                                                    placeholder="Início"
                                                    className="w-full h-10 bg-slate-950/60"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 w-full" />

                                    {/* Subthemes (Study Track) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Trilha de Estudo</label>
                                            <button
                                                type="button"
                                                onClick={autoSortSubthemes}
                                                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                                title="Ordenar por Dificuldade"
                                            >
                                                <ArrowDownUp className="w-3 h-3" />
                                                Ordenar
                                            </button>
                                        </div>

                                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {(() => {
                                                let itemCounter = 0;
                                                return subthemes.map((st, index) => {
                                                    const isModule = st.difficulty === 'module';
                                                    if (isModule) {
                                                        itemCounter = 0;
                                                    } else {
                                                        itemCounter++;
                                                    }

                                                    return (
                                                        <div key={index} className={`flex gap-2 items-start p-2 rounded-lg border transition-all group ${isModule ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-950/30 border-slate-800/50 hover:border-white/10'}`}>
                                                            <span className={`text-[10px] font-mono mt-2.5 w-5 text-right ${isModule ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                                                                {isModule ? '#' : `${itemCounter}.`}
                                                            </span>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        className={`flex-1 h-8 text-xs ${isModule ? 'font-bold text-blue-100 border-blue-500/20 focus:border-blue-500/50 bg-blue-900/10' : 'bg-slate-950/30 border-slate-800/50'}`}
                                                                        placeholder={isModule ? "Nome do Módulo..." : `Tópico...`}
                                                                        value={st.title}
                                                                        onChange={e => handleChangeSubtheme(index, 'title', e.target.value)}
                                                                    />
                                                                    <select
                                                                        value={st.difficulty}
                                                                        onChange={(e) => handleChangeSubtheme(index, 'difficulty', e.target.value as Difficulty)}
                                                                        className={`h-8 rounded-lg bg-slate-950/50 border border-slate-800/50 text-[10px] px-2 outline-none focus:border-blue-500/50 cursor-pointer transition-colors w-24 ${DIFFICULTY_COLORS[st.difficulty]}`}
                                                                    >
                                                                        <option value="beginner">Iniciante</option>
                                                                        <option value="intermediate">Intermediário</option>
                                                                        <option value="advanced">Avançado</option>
                                                                        <option value="module">📦 Módulo</option>
                                                                    </select>
                                                                </div>
                                                                {!isModule && (
                                                                    <div className="flex items-center gap-2 pl-1">
                                                                        <div className="bg-slate-950/50 rounded-md border border-slate-800/50 p-0.5 scale-90 origin-left">
                                                                            <DurationStepper
                                                                                value={st.duration}
                                                                                onChange={(val) => handleChangeSubtheme(index, 'duration', val)}
                                                                                step={1}
                                                                                min={0}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[10px] text-slate-600">minutos estim.</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {subthemes.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSubtheme(index)}
                                                                    className="p-1.5 mt-0.5 text-slate-600 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleAddSubtheme}
                                            className="w-full border border-dashed border-slate-700 bg-slate-900/20 hover:bg-slate-800 text-xs h-8 text-slate-400 hover:text-white"
                                        >
                                            <Plus className="w-3 h-3 mr-2" />
                                            Adicionar Tópico
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Ícone</label>
                                            <SymbolPicker
                                                value={icon}
                                                onChange={setIcon}
                                                placeholder="📚"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Cor</label>
                                            <ColorPicker
                                                value={color}
                                                onChange={setColor}
                                                disabledColors={themeToEdit ? usedColors.filter(c => c !== themeToEdit.color) : usedColors}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image */}
                                <div className="bg-slate-900/20 rounded-xl">
                                    <ImageUpload label="Capa do Card (Opcional)" value={imageUrl} onChange={setImageUrl} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800/50 mt-6 px-6">
                        {themeToEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    deleteTheme(themeToEdit.id);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-slate-400 hover:text-white text-xs h-9 px-4"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 text-xs font-bold uppercase tracking-wide h-9 px-6 rounded-lg transition-all active:scale-95"
                            >
                                {themeToEdit ? "Salvar" : "Criar Tema"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
