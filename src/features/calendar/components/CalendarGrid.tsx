import React from 'react';

interface CalendarGridProps {
    children: React.ReactNode;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ children }) => {
    return (
        <div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-xl shadow-2xl ring-1 ring-black/40">
            <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => (
                    <div key={day} className="py-4 text-center">
                        <span className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</span>
                        <span className="md:hidden text-xs font-bold text-slate-500 uppercase tracking-widest">{day.slice(0, 3)}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-black/10">
                {children}
            </div>
        </div>
    );
};
