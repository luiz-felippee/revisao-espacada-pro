import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    label?: string;
    value?: string;
    onChange: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(value);

    // Sync preview with incoming value if needed (e.g. edit mode, though we only have add mode now)
    React.useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple size validation (Limit to 5MB before optimization)
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 5MB.");
            return;
        }

        try {
            const { optimizeImage } = await import('../../lib/imageOptimizer');
            const optimizedBase64 = await optimizeImage(file, 800, 0.8);

            setPreview(optimizedBase64);
            onChange(optimizedBase64);
        } catch (error) {
            console.error("Erro ao otimizar imagem:", error);
            alert("Erro ao processar imagem. Tente outra.");
        }
    };

    const handleClear = () => {
        setPreview(undefined);
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-1">
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg p-6 bg-slate-900/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400 group"
                >
                    <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Clique para enviar uma imagem</span>
                    <span className="text-xs text-slate-600">WebP Automático • Max 5MB</span>
                </div>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 group">
                    <img src={preview} alt="Preview" className="w-full h-32 object-cover" />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Imagem selecionada
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};
