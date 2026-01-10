/**
 * Parses a date string in YYYY-MM-DD format as LOCAL midnight (not UTC)
 * This prevents timezone-related bugs where dates shift by one day
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing local midnight on that date
 */
export const parseLocalDate = (dateStr: string | number | Date): Date => {
    // If already a Date object, return it
    if (dateStr instanceof Date) {
        return dateStr;
    }

    // If it's a number (timestamp), convert it
    if (typeof dateStr === 'number') {
        return new Date(dateStr);
    }

    // Check if it's YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        // Create date at LOCAL midnight (not UTC)
        return new Date(year, month - 1, day);
    }

    // Fallback to standard Date parsing
    return new Date(dateStr);
};

/**
 * Calculates the difference in days between two dates
 * Always rounds to whole days and handles timezone correctly
 */
export const diffInDays = (date1: Date | string, date2: Date | string): number => {
    const d1 = parseLocalDate(date1);
    const d2 = parseLocalDate(date2);

    // Reset both dates to midnight to avoid partial day issues
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
