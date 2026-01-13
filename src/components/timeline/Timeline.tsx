import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { TimelineItem } from './TimelineItem';
import type { SummaryEntry } from '../../types';

interface TimelineProps {
    items: SummaryEntry[];
    emptyMessage?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
    items,
    emptyMessage = 'Nenhum evento ainda'
}) => {
    return (
        <div className="relative">
            {items.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium mb-2">{emptyMessage}</p>
                    <p className="text-slate-600 text-sm">
                        Suas atividades aparecerão aqui automaticamente
                    </p>
                </div>
            ) : (
                <>
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-transparent" />

                    <div className="relative space-y-6">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                                <TimelineItem key={item.id} item={item} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};
