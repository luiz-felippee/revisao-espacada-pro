import React from 'react';
import type { Collaborator } from '../../types';

interface CollaboratorBadgeProps {
    collaborators: Collaborator[];
    maxVisible?: number;
}

export const CollaboratorBadge: React.FC<CollaboratorBadgeProps> = ({
    collaborators,
    maxVisible = 3,
}) => {
    if (collaborators.length === 0) return null;

    const visible = collaborators.slice(0, maxVisible);
    const remaining = collaborators.length - maxVisible;

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((collaborator, index) => (
                <div
                    key={collaborator.userId}
                    className="relative group"
                    style={{ zIndex: visible.length - index }}
                >
                    <div
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                        title={`${collaborator.name} (${collaborator.role})`}
                    >
                        {collaborator.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {collaborator.name}
                    </div>
                </div>
            ))}

            {remaining > 0 && (
                <div
                    className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                    title={`+${remaining} outros colaboradores`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
};
