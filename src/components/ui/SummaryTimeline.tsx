import React from 'react';
import type { SummaryEntry } from '../../types';
import { formatSummaryDate, formatSummaryTime } from '../../utils/summaries';
import { CheckCircle, Clock, Target, FileText, TrendingUp, Award } from 'lucide-react';

interface SummaryTimelineProps {
    summaries: SummaryEntry[];
    title?: string;
    maxItems?: number;
    showEmptyState?: boolean;
}

const getIconByType = (type: SummaryEntry['type']) => {
    switch (type) {
        case 'review':
            return <Award className="w-4 h-4" />;
        case 'goal':
            return <Target className="w-4 h-4" />;
        case 'session':
            return <Clock className="w-4 h-4" />;
        case 'completion':
            return <CheckCircle className="w-4 h-4" />;
        case 'progress':
            return <TrendingUp className="w-4 h-4" />;
        case 'note':
            return <FileText className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
    }
};

const getColorByType = (type: SummaryEntry['type']) => {
    switch (type) {
        case 'review':
            return 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400';
        case 'goal':
            return 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400';
        case 'session':
            return 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400';
        case 'completion':
            return 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400';
        case 'progress':
            return 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400';
        case 'note':
            return 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400';
        default:
            return 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400';
    }
};

const SummaryTimeline: React.FC<SummaryTimelineProps> = ({
    summaries = [],
    title = 'Histórico',
    maxItems,
    showEmptyState = true,
}) => {
    const sortedSummaries = [...summaries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const displaySummaries = maxItems
        ? sortedSummaries.slice(0, maxItems)
        : sortedSummaries;

    if (displaySummaries.length === 0 && !showEmptyState) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    {title}
                </h3>
                {summaries.length > 0 && (
                    <span className="text-sm text-gray-400">
                        {summaries.length} {summaries.length === 1 ? 'entrada' : 'entradas'}
                    </span>
                )}
            </div>

            {/* Timeline */}
            {displaySummaries.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Nenhum histórico registrado</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Os eventos e resumos aparecerão aqui
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displaySummaries.map((summary, index) => (
                        <div
                            key={summary.id}
                            className={`
                relative bg-gradient-to-br ${getColorByType(summary.type)}
                border rounded-xl p-4
                hover:scale-[1.02] transition-all duration-300
                group
              `}
                        >
                            {/* Timeline Connector */}
                            {index < displaySummaries.length - 1 && (
                                <div className="absolute left-6 top-full h-3 w-0.5 bg-gradient-to-b from-gray-600/50 to-transparent" />
                            )}

                            <div className="flex gap-3">
                                {/* Icon */}
                                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg 
                  bg-gradient-to-br ${getColorByType(summary.type)}
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300
                `}>
                                    {getIconByType(summary.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {summary.title && (
                                                <h4 className="font-semibold text-white">
                                                    {summary.title}
                                                </h4>
                                            )}
                                            {summary.number !== undefined && (
                                                <span className={`
                          px-2 py-0.5 rounded-full text-xs font-bold
                          ${getColorByType(summary.type)}
                          border
                        `}>
                                                    {summary.type === 'review' ? `#${summary.number}` : `${summary.number}%`}
                                                </span>
                                            )}
                                        </div>
                                        <time className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatSummaryTime(summary.timestamp)}
                                        </time>
                                    </div>

                                    {summary.description && (
                                        <p className="text-sm text-gray-300 mb-2 break-words">
                                            {summary.description}
                                        </p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>{formatSummaryDate(summary.timestamp)}</span>
                                        {summary.metadata?.sessionDuration && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {summary.metadata.sessionDuration} min
                                            </span>
                                        )}
                                        {summary.metadata?.status && (
                                            <span className="px-2 py-0.5 rounded bg-gray-700/50 border border-gray-600/30">
                                                {summary.metadata.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Show More */}
            {maxItems && summaries.length > maxItems && (
                <button
                    className="
            w-full py-2 px-4 rounded-lg
            bg-gradient-to-r from-purple-600/20 to-blue-600/20
            border border-purple-500/30
            text-purple-300 font-medium
            hover:from-purple-600/30 hover:to-blue-600/30
            transition-all duration-300
          "
                >
                    Ver mais {summaries.length - maxItems} {summaries.length - maxItems === 1 ? 'entrada' : 'entradas'}
                </button>
            )}
        </div>
    );
};

export default SummaryTimeline;
