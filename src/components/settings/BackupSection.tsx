import React, { useState, useRef } from 'react';
import { Save, Upload, FileCheck, AlertTriangle, X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { usePomodoroContext } from '../../context/PomodoroContext';
import { Card } from '../ui/Card';
import { exportToJSON, validateBackupData, readJSONFile, formatFileSize, type BackupData } from '../../utils/exportData';
import { useToast } from '../../context/ToastContext';

export const BackupSection: React.FC = () => {
    const { themes, tasks, goals, gamification, zenMode, restoreBackup } = useStudy();
    const { profile } = useAuth();
    const { settings } = usePomodoroContext();
    const { showToast } = useToast();

    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<BackupData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data: BackupData = {
            timestamp: new Date().toISOString(),
            profile: profile ? {
                username: profile.name,
                email: profile.email,
                avatar: profile.avatar
            } : undefined,
            settings,
            themes,
            tasks,
            goals,
            gamification,
            zenMode
        };

        exportToJSON(data);
        showToast('Backup baixado com sucesso!', 'success');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            const data = await readJSONFile(file);
            const validation = validateBackupData(data);

            if (!validation.valid) {
                showToast(validation.error || 'Arquivo inválido', 'error');
                setSelectedFile(null);
                setPreviewData(null);
                return;
            }

            setPreviewData(data);
        } catch (error: any) {
            showToast(error.message || 'Erro ao ler o arquivo', 'error');
            setSelectedFile(null);
            setPreviewData(null);
        }
    };

    const handleImport = async () => {
        if (!previewData) return;

        setIsImporting(true);

        try {
            await restoreBackup(previewData);

            showToast('✅ Backup restaurado com sucesso!', 'success');

            // Reset UI state
            setSelectedFile(null);
            setPreviewData(null);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Erro ao restaurar backup. Seus dados atuais foram preservados.';

            showToast(errorMessage, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewData(null);
        setIsImporting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Export Card */}
            <Card className="bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <Save className="w-5 h-5 text-emerald-400" />
                            Exportar Dados (JSON)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Baixe uma cópia completa dos seus temas, tarefas e progresso.
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                            <span>📦 {themes.length} temas</span>
                            <span>✓ {tasks.length} tarefas</span>
                            <span>🎯 {goals.length} metas</span>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                    >
                        <Save className="w-4 h-4" />
                        Baixar Backup
                    </button>
                </div>
            </Card>

            {/* Import Card */}
            <Card className="bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-200 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-400" />
                            Importar Backup
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Restaure seus dados a partir de um arquivo de backup.
                        </p>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="backup-file-input"
                        />
                        <label
                            htmlFor="backup-file-input"
                            className="bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-900/20"
                        >
                            <Upload className="w-4 h-4" />
                            Selecionar Arquivo
                        </label>
                    </div>
                </div>

                {/* File Preview */}
                {selectedFile && previewData && (
                    <div className="mt-4 p-4 bg-slate-950/50 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-bold text-blue-300">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-slate-900/50 p-2 rounded-lg">
                                <p className="text-xs text-slate-500">Temas</p>
                                <p className="text-lg font-bold text-orange-400">{previewData.themes.length}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded-lg">
                                <p className="text-xs text-slate-500">Tarefas</p>
                                <p className="text-lg font-bold text-purple-400">{previewData.tasks.length}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded-lg">
                                <p className="text-xs text-slate-500">Metas</p>
                                <p className="text-lg font-bold text-blue-400">{previewData.goals.length}</p>
                            </div>
                            <div className="bg-slate-900/50 p-2 rounded-lg">
                                <p className="text-xs text-slate-500">Backup de</p>
                                <p className="text-xs font-bold text-slate-300">
                                    {new Date(previewData.timestamp).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200">
                                    <span className="font-bold">Atenção:</span> Importar substituirá todos os seus dados atuais.
                                    Recomendamos fazer um backup antes.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleImport}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <Upload className="w-4 h-4" />
                                Restaurar Backup
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
