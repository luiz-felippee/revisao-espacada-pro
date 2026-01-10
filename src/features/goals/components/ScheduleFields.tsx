import React from 'react';
import { format } from 'date-fns';
import { Input } from '../../../components/ui/Input';
import { DatePicker } from '../../../components/ui/DatePicker';
import { DaySelector } from '../../../components/forms/DaySelector';

interface ScheduleFieldsProps {
    type: 'simple' | 'checklist' | 'habit';
    startDate: string;
    deadline: string;
    recurrence: number[];
    onStartDateChange: (date: string) => void;
    onDeadlineChange: (date: string) => void;
    onRecurrenceChange: (days: number[]) => void;
}

export const ScheduleFields: React.FC<ScheduleFieldsProps> = ({
    type,
    startDate,
    deadline,
    recurrence,
    onStartDateChange,
    onDeadlineChange,
    onRecurrenceChange
}) => {
    return (
        <div className="space-y-3 pt-2">
            {type === 'habit' && (
                <div className="bg-slate-900/40 rounded-xl border border-white/5 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-[10px] uppercase font-bold text-slate-500 pl-1 mb-2 block">Dias da Semana</label>
                    <DaySelector selectedDays={recurrence} onChange={onRecurrenceChange} />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Data de Início</label>
                    <DatePicker
                        value={startDate}
                        onChange={onStartDateChange}
                        className="w-full"
                        placeholder="Início"
                    />
                </div>
                {type === 'checklist' ? (
                    <div className="space-y-1.5 opacity-50 pointer-events-none">
                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Prazo Final (Auto)</label>
                        <Input
                            value={deadline ? format((() => {
                                if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
                                    const [y, m, d] = deadline.split('-').map(Number);
                                    return new Date(y, m - 1, d);
                                }
                                return new Date(deadline);
                            })(), 'dd/MM/yyyy') : ''}
                            readOnly
                            className="w-full bg-slate-950/30 text-slate-400 cursor-not-allowed"
                            placeholder="Calculado automaticamente"
                        />
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-1">Prazo Final</label>
                        <DatePicker
                            value={deadline}
                            onChange={onDeadlineChange}
                            className="w-full"
                            placeholder="Prazo Final"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
