import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DatePickerProps {
    value?: Date | string;
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, placeholder = "Selecione uma data", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Parse value to Date object properly handling Timezones
    // "2025-12-16" is parsed as UTC Midnight by new Date(), which becomes Dec 15th 21:00 in Brazil
    // We want it to be Local Midnight.
    const selectedDate = React.useMemo(() => {
        if (!value) return undefined;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
            // Check for YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                const [y, m, d] = value.split('-').map(Number);
                return new Date(y, m - 1, d); // Local Midnight
            }
            return new Date(value);
        }
        return undefined;
    }, [value]);

    const updatePosition = React.useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const popoverWidth = 300;
            const popoverHeight = 400; // Increased for full calendar
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const spaceRight = window.innerWidth - rect.left;

            let topPosition = rect.bottom + window.scrollY + 8;
            let leftPosition = rect.left + window.scrollX;

            // Vertical positioning - flip up if not enough space below
            if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
                topPosition = rect.top + window.scrollY - popoverHeight - 8;
            }

            // Horizontal positioning - adjust if goes off-screen
            if (spaceRight < popoverWidth) {
                // Align right edge of popover with right edge of screen (with margin)
                leftPosition = window.innerWidth + window.scrollX - popoverWidth - 16;
            }

            // Ensure popover doesn't go off left edge
            if (leftPosition < window.scrollX + 8) {
                leftPosition = window.scrollX + 8;
            }

            // Ensure popover doesn't go off top edge
            if (topPosition < window.scrollY + 8) {
                topPosition = window.scrollY + 8;
            }

            setCoords({
                top: topPosition,
                left: leftPosition
            });
        }
    }, []);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is inside container (trigger) OR inside popover (portal)
            const isClickInContainer = containerRef.current && containerRef.current.contains(event.target as Node);
            const isClickInPopover = popoverRef.current && popoverRef.current.contains(event.target as Node);

            if (!isClickInContainer && !isClickInPopover) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Update position on scroll/resize
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    const toggleOpen = () => {
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleDateClick = (day: Date) => {
        // Return YYYY-MM-DD string as expected by standard inputs
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4 px-1">
                <button
                    onClick={(e) => { e.preventDefault(); prevMonth(); }}
                    className="p-1 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-bold text-slate-200 capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </div>
                <button
                    onClick={(e) => { e.preventDefault(); nextMonth(); }}
                    className="p-1 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEE";
        const days = [];
        const startDate = startOfWeek(currentMonth, { locale: ptBR }); // Provide locale for correct start day

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-[10px] font-bold text-slate-500 uppercase text-center py-1" key={i}>
                    {format(addDays(startDate, i), dateFormat, { locale: ptBR }).replace('.', '')}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-1">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: ptBR });
        const endDate = endOfWeek(monthEnd, { locale: ptBR });

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        className="p-0.5"
                        key={day.toString()}
                    >
                        <button
                            onClick={(e) => { e.preventDefault(); handleDateClick(cloneDay); }}
                            className={cn(
                                "w-full aspect-square rounded-lg flex items-center justify-center text-sm transition-all relative font-medium group",
                                // Text color
                                !isCurrentMonth ? "text-slate-600 font-normal" : "text-slate-300",
                                isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-bold" : "hover:bg-slate-700/50 hover:text-white",
                                // Today indicator
                                isToday(day) && !isSelected && "border border-blue-500/30 text-blue-400"
                            )}
                        >
                            {formattedDate}
                            {/* Today Dot */}
                            {isToday(day) && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                            )}
                        </button>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };

    // Portal Content for the Popover
    const PopoverContent = (
        <div
            ref={popoverRef}
            style={{
                top: coords.top,
                left: coords.left,
                position: 'absolute',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}
            className="p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[999999] w-[300px] animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Triangle Arrow - Simplified as top centered relative to popup, but since we Portal, visual alignment is tricky. Removing arrow for cleanliness in Portal mode */}
            {/* <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-900 border-t border-l border-slate-700 rotate-45" /> */}

            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between">
                <button
                    onClick={(e) => { e.preventDefault(); handleDateClick(new Date()); }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 py-1"
                >
                    Selecionar Hoje
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
                    className="text-xs text-slate-500 hover:text-slate-300 py-1"
                >
                    Limpar
                </button>
            </div>
        </div>
    );

    return (
        <div className={cn("space-y-1", className)} ref={containerRef}>
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}

            <div className="relative">
                <button
                    type="button"
                    onClick={toggleOpen}
                    className={cn(
                        "w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-left transition-all hover:bg-slate-900",
                        isOpen ? "ring-2 ring-blue-500/50 border-blue-500" : "hover:border-slate-600",
                        !selectedDate && "text-slate-500"
                    )}
                >
                    <span className="flex items-center gap-2 truncate text-sm">
                        <CalendarIcon className="w-4 h-4 text-slate-500 shrink-0" />
                        {selectedDate
                            ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                            : placeholder}
                    </span>
                    {selectedDate && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </div>
                    )}
                </button>

                {/* Render Popover via Portal */}
                {isOpen && createPortal(PopoverContent, document.body)}
            </div>
        </div>
    );
};
