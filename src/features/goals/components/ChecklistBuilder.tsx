import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { format } from 'date-fns';

interface ChecklistItem {
    id: string;
    title: string;
    estimatedTime: string;
    completed: boolean;
    durationDays: number;
    startDate?: string;
    deadline?: string;
}

interface RecalculateResult {
    updatedItems: ChecklistItem[];
    finalDate: string;
}

interface ChecklistBuilderProps {
    checklist: ChecklistItem[];
    onChange: (items: ChecklistItem[]) => void;
    startDate: string;
    recalculateSchedule: (items: ChecklistItem[], baseStart: string) => RecalculateResult;
    setDeadline: (date: string) => void;
}

const ChecklistBuilderComponent: React.FC<ChecklistBuilderProps> = ({
    checklist,
    onChange,
    startDate,
    recalculateSchedule,
    setDeadline
}) => {
    // Helper to parse YYYY-MM-DD as Local Midnight (avoiding UTC timezone issues)
    const parseLocalDate = (dateStr: string): Date => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d); // Local Midnight
        }
        return new Date(dateStr);
    };

    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemTime, setNewItemTime] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleAddItem = () => {
        if (!newItemTitle) return;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: newItemTitle,
            estimatedTime: newItemTime || '1',
            completed: false,
            durationDays: parseInt(newItemTime || '1')
        };

        const newChecklist = [...checklist, newItem];
        const { updatedItems, finalDate } = recalculateSchedule(newChecklist, startDate);

        onChange(updatedItems);
        if (finalDate) setDeadline(finalDate);

        setNewItemTitle('');
        setNewItemTime('');
    };

    const handleRemoveItem = (index: number) => {
        const newChecklist = checklist.filter((_, i) => i !== index);
        const scheduled = recalculateSchedule(newChecklist, startDate);
        onChange(scheduled.updatedItems);
        if (scheduled.finalDate) setDeadline(scheduled.finalDate);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        // Use RAF for smooth state update
        requestAnimationFrame(() => {
            setDraggedIndex(index);
        });
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        // Only update if changed to avoid unnecessary rerenders
        if (dragOverIndex !== index) {
            requestAnimationFrame(() => {
                setDragOverIndex(index);
            });
        }
    };

    const handleDragEnd = () => {
        requestAnimationFrame(() => {
            setDraggedIndex(null);
            setDragOverIndex(null);
        });
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === targetIndex) {
            handleDragEnd();
            return;
        }

        const reordered = [...checklist];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        const { updatedItems, finalDate } = recalculateSchedule(reordered, startDate);
        onChange(updatedItems);
        if (finalDate) setDeadline(finalDate);

        handleDragEnd();
    };

    return (
        <div className="bg-slate-900/40 rounded-xl border border-white/5 p-4 space-y-4">
            <div className="animate-in fade-in zoom-in-95 duration-200 space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Etapas ({checklist.length}) - Sequenciais</label>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {checklist.map((item, index) => {
                        const isDragging = draggedIndex === index;
                        const isDragOver = dragOverIndex === index;

                        return (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex gap-2 items-center bg-slate-950/50 p-2 rounded-lg group border transition-all cursor-grab active:cursor-grabbing ${isDragging
                                    ? 'opacity-40 border-blue-500/50'
                                    : isDragOver
                                        ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                                        : 'border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" title="Arrastar para reordenar">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-slate-500 w-5 text-center font-mono">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-slate-300 truncate">{item.title}</div>
                                    <div className="flex gap-3 text-[10px] text-slate-500 mt-0.5">
                                        {item.estimatedTime && <span className="flex items-center gap-1">⏱ {item.estimatedTime} dias</span>}
                                        {item.startDate && item.deadline && (
                                            <span className="flex items-center gap-1 text-blue-400">
                                                📅 {format(parseLocalDate(item.startDate), 'dd/MM')} ➔ {format(parseLocalDate(item.deadline), 'dd/MM')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="text-slate-600 hover:text-red-400 p-1.5 transition-colors"
                                        title="Remover Item"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <div className="grid grid-cols-[1fr_70px_50px] gap-2 items-end pt-1">
                        <div className="space-y-1">
                            <Input
                                value={newItemTitle}
                                onChange={e => setNewItemTitle(e.target.value)}
                                placeholder="Nova etapa..."
                                className="bg-slate-950/30 border-white/5 h-9 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Input
                                value={newItemTime}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    if (val < 1) return;
                                    setNewItemTime(e.target.value);
                                }}
                                placeholder="Dias"
                                type="number"
                                min={1}
                                className="bg-slate-950/30 border-white/5 h-9 text-xs text-center"
                                title="Duração em dias"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="h-9 w-9 flex items-center justify-center bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all border border-blue-600/20 hover:shadow-lg hover:shadow-blue-500/20 mb-[1px]"
                        >
                            <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                    </div>

                    <p className="text-[10px] text-slate-500 pl-1 italic">
                        * As etapas são agendadas sequencialmente em dias.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ChecklistBuilder = React.memo(ChecklistBuilderComponent);
