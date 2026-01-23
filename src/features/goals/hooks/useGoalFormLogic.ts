import { useState, useEffect } from 'react';
import { useStudy } from '../../../context/StudyContext';
import { format, addDays } from 'date-fns';
import type { Goal } from '../../../types';
import { z } from 'zod';

interface UseGoalFormLogicProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: Goal;
    defaultThemeId?: string;
    defaultType?: 'simple' | 'checklist' | 'habit';
}

const goalSchema = z.object({
    title: z.string().min(3, 'O título da meta deve ter pelo menos 3 caracteres'),
    startDate: z.string().min(1, 'A data de início é obrigatória'),
    deadline: z.string().min(1, 'O prazo é obrigatório'),
    type: z.enum(['simple', 'checklist', 'habit'])
});

export const useGoalFormLogic = ({ isOpen, onClose, goalToEdit, defaultThemeId, defaultType }: UseGoalFormLogicProps) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'simple' | 'checklist' | 'habit'>(defaultType || 'simple');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState<any>(goalToEdit?.priority || 'medium');
    const [relatedThemeId, setRelatedThemeId] = useState('');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [deadline, setDeadline] = useState('');
    const [recurrence, setRecurrence] = useState<number[]>([]);
    const [icon, setIcon] = useState('');
    const [color, setColor] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [duration, setDuration] = useState('25');
    const [checklist, setChecklist] = useState<any[]>(goalToEdit?.checklist || []);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { addGoal, updateGoal, deleteGoal, themes, tasks, goals } = useStudy();

    const usedColors = [
        ...themes.map(t => t.color),
        ...tasks.map(t => t.color),
        ...goals.map(g => g.color)
    ].filter(Boolean) as string[];

    // Reset or Set values when goalToEdit changes
    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setTitle(goalToEdit?.title || '');
            setType(goalToEdit?.type || defaultType || 'simple');
            setCategory(goalToEdit?.category || '');
            setPriority(goalToEdit?.priority || 'medium');
            setRelatedThemeId(goalToEdit?.relatedThemeId || defaultThemeId || '');
            setStartDate(goalToEdit?.startDate || format(new Date(), 'yyyy-MM-dd'));
            setDeadline(goalToEdit?.deadline || '');
            setRecurrence(goalToEdit?.recurrence || []);
            setIcon(goalToEdit?.icon || '');
            setColor(goalToEdit?.color || '');
            setImageUrl(goalToEdit?.imageUrl || '');
            setDuration(goalToEdit?.durationMinutes?.toString() || '25');
            setChecklist(goalToEdit?.checklist || []);

            // If creating a NEW Habit, default recurrence to include Today
            const isNewItem = !goalToEdit;
            const currentType = (goalToEdit?.type || defaultType || 'simple');

            if (isNewItem && currentType === 'habit') {
                const todayDow = new Date().getDay();
                setRecurrence([todayDow]);
            }
        }
    }, [isOpen, goalToEdit, defaultThemeId, defaultType]);

    // Helper to parse YYYY-MM-DD as Local Midnight (avoiding UTC timezone issues)
    const parseLocalDate = (dateStr: string): Date => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d); // Local Midnight
        }
        return new Date(dateStr);
    };

    // Recalculate dates for all items based on sequence
    const recalculateSchedule = (items: any[], baseStart: string) => {
        let currentDate = parseLocalDate(baseStart);

        const updatedItems = items.map((item, index) => {
            const durationDays = parseInt(item.estimatedTime || '1') || 1;
            const start = new Date(currentDate);
            const end = addDays(start, durationDays);

            const itemWithDates = {
                ...item,
                startDate: format(start, 'yyyy-MM-dd'),
                deadline: format(end, 'yyyy-MM-dd'),
                order: index
            };

            currentDate = end;
            return itemWithDates;
        });

        const finalDate = updatedItems.length > 0
            ? updatedItems[updatedItems.length - 1].deadline
            : '';

        return { updatedItems, finalDate };
    };

    // Update schedule when Start Date changes
    useEffect(() => {
        if (type === 'checklist' && checklist.length > 0 && startDate) {
            const { updatedItems, finalDate } = recalculateSchedule(checklist, startDate);
            const currentLastString = JSON.stringify(checklist.map(i => i.startDate + i.deadline));
            const newLastString = JSON.stringify(updatedItems.map(i => i.startDate + i.deadline));

            if (currentLastString !== newLastString) {
                setChecklist(updatedItems);
                if (finalDate) setDeadline(finalDate);
            }
        }
    }, [startDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Pre-calculation for Checklist type
        let finalChecklist = checklist;
        let finalDeadline = deadline;

        if (type === 'checklist') {
            const result = recalculateSchedule(checklist, startDate);
            finalChecklist = result.updatedItems;
            finalDeadline = result.finalDate || deadline;
        }

        // Validate
        const result = goalSchema.safeParse({
            title,
            startDate,
            deadline: finalDeadline,
            type
        });

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(err => {
                if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        const goalData = {
            title,
            type,
            category: category.trim() || 'Geral',
            priority,
            startDate,
            deadline: finalDeadline,
            recurrence: type === 'habit' ? recurrence : undefined,
            relatedThemeId: relatedThemeId || undefined,
            icon: icon || undefined,
            color: color || undefined,
            imageUrl: imageUrl || undefined,
            durationMinutes: duration ? parseInt(duration) : undefined,
            checklist: type === 'checklist' ? finalChecklist : undefined
        };

        if (goalToEdit) {
            updateGoal(goalToEdit.id, goalData);
        } else {
            addGoal(goalData);
        }

        onClose();
    };

    const handleDelete = () => {
        if (goalToEdit && window.confirm('Tem certeza que deseja excluir esta meta?')) {
            deleteGoal(goalToEdit.id);
            onClose();
        }
    };

    return {
        // State
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
        errors, setErrors, // Export errors

        // Derived
        usedColors,
        themes,

        // Actions
        handleSubmit,
        handleDelete,
        recalculateSchedule
    };
};
