import { useState } from 'react';
import { Reorder } from 'framer-motion';


import { ChevronLeft, ChevronRight, ChevronUp, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MissionItem } from './MissionItem';

interface MissionListProps {
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
    handlePrevDay: () => void;
    handleNextDay: () => void;
    onCollapse: () => void;

    // Lists
    allHabits: any[];
    allReviews: any[];
    allTasks: any[]; // Using any to avoid complex type import for now (should be fixed later)

    // Logic
    isCurrentDay: boolean;
    dateStr: string;
    hasOverdueItems: boolean;
    dailySchedule: Record<string, string>;
    missionProgress: Record<string, { startedAt?: number }>;
    activeFocusId?: string;

    // Handlers
    handleSetTime: (id: string, time: string) => void;
    handleFocusItem: (item: any, type: string) => void;
    handleToggleItem: (item: any, type: string) => void;

    // Stats
    isAllDone: boolean;
}

export const MissionList = ({
    selectedDate, setSelectedDate, handlePrevDay, handleNextDay, onCollapse,
    allHabits, allReviews, allTasks,
    isCurrentDay, dateStr, hasOverdueItems, dailySchedule, missionProgress, activeFocusId,
    handleSetTime, handleFocusItem, handleToggleItem,
    isAllDone
}: MissionListProps) => {
    const [showCalendar, setShowCalendar] = useState(false);

    // --- DRAG AND DROP PERSISTENCE LOGIC ---
    // Single consolidated key: 'mission_list_order' -> { habit: [ids], review: [ids], task: [ids] }
    const [itemOrder, setItemOrder] = useState<{ [key: string]: string[] }>(() => {
        try {
            return JSON.parse(localStorage.getItem('mission_list_order') || '{}');
        } catch { return {}; }
    });

    const handleReorder = (type: string, newOrder: string[]) => {
        const updated = { ...itemOrder, [type]: newOrder };
        setItemOrder(updated);
        localStorage.setItem('mission_list_order', JSON.stringify(updated));
    };

    // Helper to sort items based on persisted ID list + overdue priority
    const sortItems = (items: any[], type: string) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');

        // Separate overdue and non-overdue items
        const overdueItems: any[] = [];
        const normalItems: any[] = [];

        items.forEach(item => {
            const itemDateStr = item.date || (item.deadline ? item.deadline.split('T')[0] : undefined);
            const isDone = item.isDone || item.status === 'completed';
            const isOverdue = !isDone && itemDateStr && itemDateStr < todayStr;

            if (isOverdue) {
                overdueItems.push({ ...item, isOverdue: true });
            } else {
                normalItems.push(item);
            }
        });

        // Sort overdue items by date (oldest first)
        overdueItems.sort((a, b) => {
            const dateA = a.date || (a.deadline ? a.deadline.split('T')[0] : '9999-99-99');
            const dateB = b.date || (b.deadline ? b.deadline.split('T')[0] : '9999-99-99');
            return dateA.localeCompare(dateB);
        });

        // Sort normal items using persisted order
        const order = itemOrder[type] || [];
        const map = new Map(normalItems.map(i => [i.id || i.subthemeId, i]));
        const sortedNormal: any[] = [];

        // 1. Add items in explicit order
        order.forEach(id => {
            if (map.has(id)) {
                sortedNormal.push(map.get(id));
                map.delete(id);
            }
        });

        // 2. Append new/remaining items (maintain original relative order)
        normalItems.forEach(i => {
            const id = i.id || i.subthemeId;
            if (map.has(id)) {
                sortedNormal.push(i);
            }
        });

        // Return overdue items first, then normal items
        return [...overdueItems, ...sortedNormal];
    };

    return (
        <>
            {/* Date Navigation & Calendar Toggle */}
            <div className="px-4 py-3 bg-slate-900/30 border-b border-slate-800/50 flex items-center justify-between shrink-0">
                <button onClick={handlePrevDay} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>

                <div className="flex flex-col items-center cursor-pointer group" onClick={() => setShowCalendar(!showCalendar)}>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                        {isToday(selectedDate) ? 'Hoje' : format(selectedDate, 'EEEE', { locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={handleNextDay} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    <button onClick={onCollapse} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors ml-1" title="Minimizar">
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Calendar Popover */}
            {showCalendar && (
                <div className="p-4 bg-slate-900 border-b border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <span key={d} className="text-[10px] text-slate-500 font-bold">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 14 }).map((_, i) => {
                            const d = addDays(selectedDate, i - 7);
                            const isSel = d.toDateString() === selectedDate.toDateString();
                            return (
                                <button
                                    key={i}
                                    onClick={() => { setSelectedDate(d); setShowCalendar(false); }}
                                    className={cn(
                                        "h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all",
                                        isSel ? "bg-slate-800 text-blue-400 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-110 z-10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                                        isToday(d) && !isSel && "text-blue-400 font-extrabold"
                                    )}
                                >
                                    {format(d, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar max-h-[60vh] select-none">
                <div className="space-y-6">
                    {[
                        { title: 'Hábitos & Rotina', rawItems: allHabits, type: 'habit' },
                        { title: 'Revisões & Estudos', rawItems: allReviews, type: 'review' },
                        { title: 'Tarefas & Missões', rawItems: allTasks, type: 'task' }
                    ].map(group => {
                        if (group.rawItems.length === 0) return null;

                        // Sort items for this render
                        const sortedItems = sortItems(group.rawItems, group.type);

                        return (
                            <div key={group.title} className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 border-l-2 border-slate-800 flex items-center justify-between">
                                    {group.title}
                                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{group.rawItems.length}</span>
                                </h4>

                                <Reorder.Group
                                    values={sortedItems.map(i => i.id || i.subthemeId)}
                                    onReorder={(newOrder) => handleReorder(group.type, newOrder)}
                                    className="space-y-4"
                                    axis="y"
                                >
                                    {sortedItems.map((item: any) => {
                                        const itemId = item.id || item.subthemeId;
                                        const isDone = item.isDone || item.status === 'completed';

                                        // ROBUST DATE CHECK V2 (date-fns)
                                        const todayStr = format(new Date(), 'yyyy-MM-dd');
                                        const isFutureContext = dateStr > todayStr;
                                        const isGlobalLocked = isFutureContext;

                                        const itemDateStr = item.date || (item.deadline ? item.deadline.split('T')[0] : undefined);
                                        const isItemOverdue = !isDone && itemDateStr && itemDateStr < dateStr;

                                        let isItemLocked = isGlobalLocked;
                                        let lockReason = item.lockReason || (isGlobalLocked ? "Agendado para o futuro" : "");

                                        if (!isItemLocked && hasOverdueItems && !isItemOverdue) {
                                            isItemLocked = true;
                                            lockReason = "Prioridade: Conclua as atividades atrasadas primeiro!";
                                        }

                                        if (itemDateStr && itemDateStr > todayStr) {
                                            isItemLocked = true;
                                            lockReason = `Agendado para ${format(new Date(itemDateStr + 'T00:00:00'), 'dd/MM')}`;
                                        }

                                        if (item.startDate && item.startDate > todayStr) {
                                            isItemLocked = true;
                                            lockReason = `Inicia em ${format(new Date(item.startDate + 'T00:00:00'), 'dd/MM')}`;
                                        }

                                        return (
                                            <Reorder.Item
                                                key={itemId}
                                                value={itemId}
                                                dragListener={true}
                                                className="cursor-move touch-none"
                                                whileDrag={{ scale: 1.02, zIndex: 50 }}
                                            >
                                                <MissionItem
                                                    item={item}
                                                    type={group.type as any}
                                                    isDone={isDone}
                                                    onToggle={() => {
                                                        if (isItemLocked) return;
                                                        handleToggleItem(item, group.type);
                                                    }}
                                                    onFocus={() => {
                                                        if (isItemLocked) return;
                                                        handleFocusItem(item, group.type);
                                                    }}
                                                    activeFocusId={activeFocusId}
                                                    activeStartTime={undefined}
                                                    isLocked={isItemLocked}
                                                    lockReason={lockReason}
                                                    scheduledTime={dailySchedule[itemId]}
                                                    onSetTime={(time) => handleSetTime(itemId, time)}
                                                    startedAt={missionProgress[itemId]?.startedAt}
                                                />
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            </div>
                        );
                    })}
                </div>

                {isAllDone && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center mt-6">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h3 className="text-emerald-400 font-bold">Missão Completa!</h3>
                        <p className="text-emerald-500/70 text-xs text-center">Você dominou o dia.</p>
                    </div>
                )}
            </div>
        </>
    );
};
