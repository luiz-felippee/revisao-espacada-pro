import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    onToday
}) => {
    return (
        <div className="sticky top-0 z-20 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 py-4 bg-slate-950/40 backdrop-blur-md -mx-4 md:-mx-8 px-4 md:px-8 border-b border-white/5 transition-all duration-300">
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 capitalize drop-shadow-sm">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h1>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Planejamento e visualização mensal
                </p>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/5 ring-1 ring-black/20 shadow-xl">
                <Button variant="ghost" onClick={onPrevMonth} className="h-9 w-9 p-0 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white" icon={ChevronLeft} />
                <Button variant="ghost" onClick={onToday} className="h-9 px-4 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider">
                    Hoje
                </Button>
                <Button variant="ghost" onClick={onNextMonth} className="h-9 w-9 p-0 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white" icon={ChevronRight} />
            </div>
        </div>
    );
};
