import type { Task, Goal } from '../types';
import { format, parseISO } from 'date-fns';

/**
 * Generate iCal format string for tasks/goals
 */
export const generateiCal = (items: (Task | Goal)[], type: 'task' | 'goal'): string => {
    const events = items.map(item => {
        const isTask = 'type' in item && (item.type === 'day' || item.type === 'period');
        const startDate = isTask ? (item as Task).date || (item as Task).startDate : (item as Goal).startDate;
        const endDate = isTask ? (item as Task).endDate : (item as Goal).deadline;

        if (!startDate) return null;

        const start = parseISO(startDate);
        const end = endDate ? parseISO(endDate) : start;

        // Format: YYYYMMDDTHHMMSSZ
        const formatDate = (date: Date) => {
            return format(date, "yyyyMMdd'T'HHmmss'Z'");
        };

        const summary = item.title.replace(/\n/g, ' ');
        const description = ('summary' in item ? item.summary : '') || '';
        const uid = `${item.id}@studypanel.app`;

        return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${summary}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
STATUS:${'status' in item && item.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}
END:VEVENT`;
    }).filter(Boolean);

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Study Panel//Study Management App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join('\n')}
END:VCALENDAR`;

    return calendar;
};

/**
 * Download iCal file
 */
export const downloadiCal = (icalContent: string, filename: string) => {
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.ics`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
