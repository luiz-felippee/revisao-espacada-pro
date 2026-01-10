import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { ShareModal } from './ShareModal';
import type { Collaborator } from '../../types';

interface ShareButtonProps {
    itemId: string;
    itemTitle: string;
    itemType: 'theme' | 'project';
    collaborators?: Collaborator[];
    onAddCollaborator?: (email: string, role: Collaborator['role']) => void;
    onRemoveCollaborator?: (userId: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    itemId,
    itemTitle,
    itemType,
    collaborators = [],
    onAddCollaborator,
    onRemoveCollaborator,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm"
                title="Compartilhar"
            >
                <Users className="w-4 h-4" />
                {collaborators.length > 0 && (
                    <span className="text-xs">{collaborators.length}</span>
                )}
            </button>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                itemTitle={itemTitle}
                itemType={itemType}
                collaborators={collaborators}
                onAddCollaborator={onAddCollaborator}
                onRemoveCollaborator={onRemoveCollaborator}
            />
        </>
    );
};
