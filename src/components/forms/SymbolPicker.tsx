import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/Input';
import { IconRenderer } from '../ui/IconRenderer';
import { Modal } from '../ui/Modal';
import { Search, Sparkles, X, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SymbolPickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const POPULAR_ICONS = [
    'Rocket', 'Cpu', 'Bot', 'Brain', 'Code', 'Terminal', 'Database', 'Server', 'Cloud', 'Zap',
    'Smartphone', 'Laptop', 'Network', 'Wifi', 'Fingerprint', 'Scan', 'Shield', 'Lock', 'Key',
    'CircuitBoard', 'Radio', 'Signal', 'Target', 'Trophy', 'Star', 'Flame', 'Book', 'GraduationCap',
    'Globe', 'Map', 'Compass', 'Flag', 'Bell', 'Calendar', 'Clock', 'Watch', 'Headphones', 'Speaker',
    'Mic', 'Camera', 'Video', 'Image', 'File', 'Folder', 'Settings', 'User', 'Users'
];

const POPULAR_EMOJIS = [
    '🚀', '🤖', '🧠', '💻', '⚡', '💾', '🔌', '📡', '🔋', '🔬',
    '👾', '🛸', '🌌', '🛰️', '🔭', '🧬', '⚛️', '🧪', '🔮', '🕹️',
    '📱', '⌚', '🖥️', '⌨️', '🖱️', '💿', '🔐', '🌐', '📚', '🎓',
    '💡', '🔥', '🎯', '🏆', '⭐', '🎨', '🎵', '🏥', '💼', '🏠'
];

const ICON_TRANSLATIONS: Record<string, string> = {
    'Rocket': 'Foguete Lançamento', 'Cpu': 'Processador Chip Tech', 'Bot': 'Robô Bot AI',
    'Brain': 'Cérebro Mente Estudo', 'Code': 'Código Dev Programação', 'Terminal': 'Terminal Console',
    'Database': 'Banco de Dados Storage', 'Server': 'Servidor Host', 'Cloud': 'Nuvem Cloud',
    'Zap': 'Raio Energia Flash', 'Smartphone': 'Celular Mobile Phone', 'Laptop': 'Notebook PC Computador',
    'Network': 'Rede Conexão', 'Wifi': 'Internet Wireless', 'Fingerprint': 'Digital Biometria',
    'Scan': 'Escanear QR', 'Shield': 'Escudo Segurança', 'Lock': 'Cadeado Bloqueio', 'Key': 'Chave Acesso',
    'CircuitBoard': 'Placa Circuito Hardware', 'Radio': 'Rádio', 'Signal': 'Sinal Conexão',
    'Target': 'Alvo Meta Objetivo', 'Trophy': 'Troféu Prêmio Vitória', 'Star': 'Estrela Favorito',
    'Flame': 'Fogo Chama Streak Hot', 'Book': 'Livro Leitura Estudo', 'GraduationCap': 'Formatura Graduação Faculdade',
    'Globe': 'Globo Mundo Terra', 'Map': 'Mapa Localização', 'Compass': 'Bússola Direção',
    'Flag': 'Bandeira Marcação', 'Bell': 'Sino Notificação Alerta', 'Calendar': 'Calendário Agenda Data',
    'Clock': 'Relógio Tempo Hora', 'Watch': 'Relógio Pulso Smartwatch', 'Headphones': 'Fones Ouvido Música Áudio',
    'Speaker': 'Alto-falante Som', 'Mic': 'Microfone Gravar Voz', 'Camera': 'Câmera Foto', 'Video': 'Vídeo Filme',
    'Image': 'Imagem Foto Galeria', 'File': 'Arquivo Documento Papel', 'Folder': 'Pasta Diretório',
    'Settings': 'Configurações Ajustes Gear', 'User': 'Usuário Pessoa Perfil', 'Users': 'Usuários Grupo Equipe Pessoas'
};

export const SymbolPicker: React.FC<SymbolPickerProps> = ({ value, onChange, placeholder = '✨', className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'icons' | 'emojis' | 'recent'>('icons');
    const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('recent_symbols');
        if (saved) {
            try {
                setRecentSymbols(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent symbols', e);
            }
        }
    }, []);

    const handleSymbolClick = (symbol: string) => {
        onChange(symbol);
        saveRecentSymbol(symbol);
        setIsOpen(false);
    };

    const saveRecentSymbol = (symbol: string) => {
        if (!symbol.trim()) return;

        setRecentSymbols(prev => {
            const filtered = prev.filter(e => e !== symbol);
            const updated = [symbol, ...filtered].slice(0, 15);
            localStorage.setItem('recent_symbols', JSON.stringify(updated));
            return updated;
        });
    };

    const filteredIcons = POPULAR_ICONS.filter(icon => {
        const search = searchQuery.toLowerCase();
        const ptFeatures = ICON_TRANSLATIONS[icon]?.toLowerCase() || '';
        return icon.toLowerCase().includes(search) || ptFeatures.includes(search);
    });

    return (
        <div className={cn("relative inline-block w-full", className)} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 h-10 bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 rounded-xl transition-all group",
                    isOpen && "ring-2 ring-blue-500/30 border-blue-500/50"
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-slate-950/50 rounded-lg group-hover:scale-110 transition-transform">
                        <IconRenderer icon={value} size={16} className="text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400 truncate font-medium">
                        {value || placeholder || "Escolher..."}
                    </span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Symbols Modal Picker */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Escolher Símbolo"
                maxWidth="md"
                wrapperClassName="z-[150]"
            >
                <div className="space-y-4">
                    {/* Search & Custom Input */}
                    <div className="relative group">
                        <Input
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            className="text-center h-12 bg-slate-900 border-white/10 text-2xl focus:border-blue-500/50 rounded-2xl"
                            placeholder={placeholder}
                        />
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-50">
                            <IconRenderer icon={value} size={24} className="text-blue-400" />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5">
                        {[
                            { id: 'icons', label: 'Ícones', icon: Sparkles },
                            { id: 'emojis', label: 'Emojis', icon: Sparkles },
                            { id: 'recent', label: 'Recentes', icon: Search }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content area */}
                    <div className="min-h-[280px]">
                        {activeTab === 'icons' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar ícone (ex: Cérebro, Foguete...)"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full h-11 bg-slate-950/80 border border-white/5 rounded-xl pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500/30 ring-0 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredIcons.map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => handleSymbolClick(iconName)}
                                            className={cn(
                                                "aspect-square flex items-center justify-center rounded-xl border transition-all duration-300",
                                                value === iconName
                                                    ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/30"
                                                    : "bg-slate-800/20 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                            )}
                                            title={ICON_TRANSLATIONS[iconName]?.split(' ')[0] || iconName}
                                        >
                                            <IconRenderer icon={iconName} size={22} />
                                        </button>
                                    ))}
                                    {filteredIcons.length === 0 && (
                                        <div className="col-span-5 py-20 text-center">
                                            <Search className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Nenhum ícone encontrado</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'emojis' && (
                            <div className="grid grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1 animate-in fade-in slide-in-from-bottom-2 duration-300 custom-scrollbar">
                                {POPULAR_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => handleSymbolClick(emoji)}
                                        className={cn(
                                            "aspect-square flex items-center justify-center rounded-xl border text-2xl transition-all duration-300",
                                            value === emoji
                                                ? "bg-blue-600 border-blue-400 scale-110 shadow-lg shadow-blue-500/30"
                                                : "bg-slate-800/20 border-white/5 hover:bg-slate-800/60"
                                        )}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'recent' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {recentSymbols.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-3">
                                        {recentSymbols.map((symbol, idx) => (
                                            <button
                                                key={`${symbol}-${idx}`}
                                                type="button"
                                                onClick={() => handleSymbolClick(symbol)}
                                                className={cn(
                                                    "aspect-square flex items-center justify-center rounded-xl border transition-all duration-300",
                                                    value === symbol
                                                        ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-lg shadow-blue-500/30"
                                                        : "bg-slate-800/20 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                                )}
                                            >
                                                <IconRenderer icon={symbol} size={symbol.length > 4 ? 22 : 26} />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                            <Sparkles className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <p className="text-xs text-slate-600 font-black uppercase tracking-widest underline decoration-blue-500/30 underline-offset-4">Nenhum símbolo recente</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
