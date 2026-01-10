import { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { cn } from '../../lib/utils';
import { MissionHeader } from './components/MissionHeader';
import { MissionSummary } from './components/MissionSummary';
import { MissionList } from './components/MissionList';
import { useMissionLogic } from './hooks/useMissionLogic';

interface TodayMissionWidgetProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const TodayMissionWidget = ({ isOpen: propIsOpen, onClose }: TodayMissionWidgetProps) => {
    // Controlled/Uncontrolled State
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = typeof propIsOpen !== 'undefined';
    const isOpen = isControlled ? propIsOpen : internalIsOpen;
    const setIsOpen = (val: boolean) => {
        if (isControlled) {
            if (!val && onClose) onClose();
        } else {
            setInternalIsOpen(val);
        }
    };

    const {
        selectedDate, setSelectedDate, handlePrevDay, handleNextDay, isCurrentDay, dateStr,
        allHabits, allReviews, allTasks,
        totalCount, completedCount, progressPercent, isAllDone, hasOverdueItems,
        dailySchedule, handleSetTime, missionProgress,
        handleFocusItem, handleToggleItem
    } = useMissionLogic();

    const { activeFocus } = useStudy();

    // Summary View State
    const [isExpanded, setIsExpanded] = useState(false);

    // Draggable Logic
    // Generic Window State
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    // Treat as "mobile/tablet" (docked at bottom) if width < 1024px
    const isMobile = windowWidth < 1024;

    // Draggable Logic
    // Default position: top-right corner
    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 1024) {
                // Keep it snapped to right on resize if desktop
                setPosition({ x: window.innerWidth - 420, y: 80 });
            }
        };

        // Initial set
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMobile) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    if (isControlled && !isOpen) return null;

    const progressLabel = `${completedCount}/${totalCount}`;

    return (
        <>
            <div
                style={!isMobile
                    ? { left: position.x, top: position.y }
                    : { bottom: '1rem', left: '1rem', right: '1rem', width: 'auto' }
                }
                className={cn(
                    "fixed z-[60] bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50 transition-all duration-300 flex flex-col",
                    isMobile
                        ? "rounded-3xl max-h-[85vh] animate-in slide-in-from-bottom duration-300"
                        : "w-[400px] rounded-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200"
                )}
            >
                <MissionHeader
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    isAllDone={isAllDone}
                    progressPercent={progressPercent}
                    progressLabel={progressLabel}
                    onMouseDown={handleMouseDown}
                />

                {!isExpanded ? (
                    <MissionSummary
                        progressPercent={progressPercent}
                        completedCount={completedCount}
                        totalCount={totalCount}
                        onExpand={() => setIsExpanded(true)}
                    />
                ) : (
                    <MissionList
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        handlePrevDay={handlePrevDay}
                        handleNextDay={handleNextDay}
                        onCollapse={() => setIsExpanded(false)}
                        allHabits={allHabits}
                        allReviews={allReviews}
                        allTasks={allTasks}
                        isCurrentDay={isCurrentDay}
                        dateStr={dateStr}
                        hasOverdueItems={hasOverdueItems}
                        dailySchedule={dailySchedule}
                        missionProgress={missionProgress}
                        activeFocusId={activeFocus?.id}
                        handleSetTime={handleSetTime}
                        handleFocusItem={handleFocusItem}
                        handleToggleItem={handleToggleItem}
                        isAllDone={isAllDone}
                    />
                )}
            </div>
            {isMobile && !isOpen && <div className="h-20" />}
        </>
    );
};
