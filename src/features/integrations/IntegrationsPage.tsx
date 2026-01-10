import React, { useState } from 'react';
import { Download, Calendar, FileText, Table, CheckCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useGamification } from '../../context/GamificationContext';
import { exportTasksToCSV, exportGoalsToCSV, exportThemesToCSV, downloadCSV } from '../../utils/csvExport';
import { generateiCal, downloadiCal } from '../../utils/icalExport';
import { exportToJSON } from '../../utils/exportData';

export const IntegrationsPage: React.FC = () => {
    const { tasks, goals, themes } = useStudy();
    const { gamification } = useGamification();
    const [exported, setExported] = useState<string | null>(null);

    const handleExport = (type: 'csv' | 'ical' | 'json', dataType: 'tasks' | 'goals' | 'themes') => {
        try {
            if (type === 'csv') {
                let csv = '';
                let filename = '';

                switch (dataType) {
                    case 'tasks':
                        csv = exportTasksToCSV(tasks);
                        filename = 'tasks';
                        break;
                    case 'goals':
                        csv = exportGoalsToCSV(goals);
                        filename = 'goals';
                        break;
                    case 'themes':
                        csv = exportThemesToCSV(themes);
                        filename = 'themes';
                        break;
                }

                downloadCSV(csv, filename);
                setExported(`${dataType.toUpperCase()} CSV`);
            } else if (type === 'ical') {
                const items = dataType === 'tasks' ? tasks : goals;
                const ical = generateiCal(items, dataType === 'tasks' ? 'task' : 'goal');
                downloadiCal(ical, dataType);
                setExported(`${dataType.toUpperCase()} iCal`);
            } else if (type === 'json') {
                // Use existing exportToJSON from backup system
                exportToJSON({
                    timestamp: new Date().toISOString(),
                    tasks,
                    goals,
                    themes,
                    gamification
                });
                setExported('Full Data JSON');
            }

            setTimeout(() => setExported(null), 3000);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const integrations = [
        {
            name: 'CSV Export',
            description: 'Exportar dados para planilha',
            icon: Table,
            color: 'from-emerald-500 to-teal-500',
            actions: [
                { label: 'Tasks', onClick: () => handleExport('csv', 'tasks') },
                { label: 'Goals', onClick: () => handleExport('csv', 'goals') },
                { label: 'Themes', onClick: () => handleExport('csv', 'themes') },
            ],
        },
        {
            name: 'iCal/Calendar',
            description: 'Sincronizar com calendário',
            icon: Calendar,
            color: 'from-blue-500 to-cyan-500',
            actions: [
                { label: 'Tasks Calendar', onClick: () => handleExport('ical', 'tasks') },
                { label: 'Goals Calendar', onClick: () => handleExport('ical', 'goals') },
            ],
        },
        {
            name: 'JSON Backup',
            description: 'Backup completo dos dados',
            icon: FileText,
            color: 'from-purple-500 to-pink-500',
            actions: [
                { label: 'Download Backup', onClick: () => handleExport('json', 'tasks') },
            ],
        },
    ];

    return (
        <div className="space-y-6 w-full pt-8 relative pb-20 fade-in">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Integrações & Export
                </h1>
                <p className="text-slate-400 mt-1">
                    Conecte com serviços externos e exporte seus dados
                </p>
            </div>

            {/* Success Message */}
            {exported && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <p className="text-emerald-300 font-medium">
                        {exported} exportado com sucesso!
                    </p>
                </div>
            )}

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map(integration => {
                    const Icon = integration.icon;

                    return (
                        <div
                            key={integration.name}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-white font-bold text-lg mb-2">
                                {integration.name}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                {integration.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {integration.actions.map(action => (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Coming Soon */}
            <div className="mt-8 p-6 bg-slate-900/50 border border-slate-700 rounded-2xl">
                <h3 className="text-white font-bold text-lg mb-3">🚀 Em Breve</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
                    <div>• Google Calendar (OAuth)</div>
                    <div>• Notion Integration</div>
                    <div>• Webhook Support</div>
                    <div>• PDF Reports</div>
                </div>
            </div>
        </div>
    );
};
