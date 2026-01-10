import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { X, Mail, UserPlus, Link2, Copy, Check, Shield, Eye, Edit, Crown } from 'lucide-react';
import type { Collaborator } from '../../types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemTitle: string;
    itemType: 'theme' | 'project';
    collaborators?: Collaborator[];
    onAddCollaborator?: (email: string, role: Collaborator['role']) => void;
    onRemoveCollaborator?: (userId: string) => void;
    onChangeRole?: (userId: string, role: Collaborator['role']) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    itemTitle,
    itemType,
    collaborators = [],
    onAddCollaborator,
    onRemoveCollaborator,
    onChangeRole,
}) => {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState<Collaborator['role']>('viewer');
    const [copied, setCopied] = useState(false);

    const handleAddCollaborator = () => {
        if (email && onAddCollaborator) {
            onAddCollaborator(email, selectedRole);
            setEmail('');
            setSelectedRole('viewer');
        }
    };

    const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/share/${itemType}/${Date.now()}`;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const roleIcons = {
        owner: Crown,
        editor: Edit,
        viewer: Eye,
    };

    const roleColors = {
        owner: 'text-amber-400',
        editor: 'text-blue-400',
        viewer: 'text-slate-400',
    };

    const roleLabels = {
        owner: 'Proprietário',
        editor: 'Editor',
        viewer: 'Visualizador',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Compartilhar {itemType === 'theme' ? 'Tema' : 'Projeto'}</h2>
                        <p className="text-slate-400 text-sm mt-1">{itemTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Add Collaborator */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-400 uppercase mb-2">
                        Convidar Pessoa
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                            />
                        </div>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Collaborator['role'])}
                            className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="viewer">Visualizador</option>
                            <option value="editor">Editor</option>
                        </select>
                        <button
                            onClick={handleAddCollaborator}
                            disabled={!email}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Share Link */}
                <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-400 uppercase">Link de Compartilhamento</span>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">
                        Qualquer pessoa com este link pode visualizar
                    </p>
                </div>

                {/* Collaborators List */}
                <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase mb-3">
                        Colaboradores ({collaborators.length})
                    </label>

                    {collaborators.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum colaborador ainda</p>
                            <p className="text-xs mt-1">Adicione pessoas para colaborar neste {itemType === 'theme' ? 'tema' : 'projeto'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {collaborators.map(collaborator => {
                                const RoleIcon = roleIcons[collaborator.role];

                                return (
                                    <div
                                        key={collaborator.userId}
                                        className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-700 rounded-lg hover:bg-slate-900/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {collaborator.name.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <p className="text-white font-medium">{collaborator.name}</p>
                                                <p className="text-xs text-slate-500">{collaborator.email}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="flex items-center gap-2">
                                            <RoleIcon className={`w-4 h-4 ${roleColors[collaborator.role]}`} />
                                            <span className="text-sm text-slate-400">{roleLabels[collaborator.role]}</span>

                                            {collaborator.role !== 'owner' && onRemoveCollaborator && (
                                                <button
                                                    onClick={() => onRemoveCollaborator(collaborator.userId)}
                                                    className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info Footer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                        <Shield className="w-4 h-4 mt-0.5" />
                        <div>
                            <p><strong>Visualizador:</strong> Pode ver conteúdo</p>
                            <p><strong>Editor:</strong> Pode editar e adicionar</p>
                            <p><strong>Proprietário:</strong> Controle total</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
