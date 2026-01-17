import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
    aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2';
}

/**
 * Componente de Imagem Otimizada
 * 
 * Features:
 * - Lazy loading automático
 * - Async decoding para não bloquear thread principal
 * - Placeholder enquanto carrega
 * - Fallback em caso de erro
 * - Aspect ratio preservado
 * - Performance otimizada
 */
export const OptimizedImage = ({
    src,
    alt,
    className,
    fallback = '/placeholder.svg',
    aspectRatio,
    ...props
}: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const aspectRatioClass = aspectRatio ? {
        '16/9': 'aspect-video',
        '4/3': 'aspect-4/3',
        '1/1': 'aspect-square',
        '3/2': 'aspect-3/2',
    }[aspectRatio] : '';

    return (
        <div className={cn('relative overflow-hidden bg-slate-800', aspectRatioClass, className)}>
            {isLoading && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
            )}

            <img
                src={hasError ? fallback : src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                }}
                className={cn(
                    'w-full h-full object-cover transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                {...props}
            />
        </div>
    );
};
