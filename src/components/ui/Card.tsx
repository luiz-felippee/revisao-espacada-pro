import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    action?: React.ReactNode;
    icon?: LucideIcon;
    emoji?: string;
    imageUrl?: string;
    hoverColor?: string;
}

export const Card: React.FC<CardProps> = ({ title, action, icon: Icon, emoji, imageUrl, hoverColor, children, className, ...props }) => {
    return (
        <div
            className={cn(
                "bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col transition-all duration-300",
                "hover:border-[var(--hover-color)] hover:shadow-[0_0_15px_-5px_var(--hover-color)]",
                className
            )}
            style={{ '--hover-color': hoverColor || '#3b82f6' } as React.CSSProperties}
            {...props}
        >
            {imageUrl && (
                <div className="h-32 w-full relative bg-slate-800">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
            )}

            {(title || action || Icon || emoji) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        {Icon && !emoji && ( // Prefer emoji if available, or allow both? Let's show Icon if no emoji, or both.
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                                <Icon className="w-4 h-4 text-blue-400" />
                            </div>
                        )}
                        {emoji && (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-lg shrink-0">
                                {emoji}
                            </div>
                        )}
                        {title && <h3 className="text-lg font-semibold text-slate-100 line-clamp-1">{title}</h3>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
};
