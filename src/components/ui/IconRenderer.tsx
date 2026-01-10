import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconRendererProps extends LucideProps {
    icon?: string;
    fallback?: React.ReactNode;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ icon, fallback, ...props }) => {
    if (!icon) return fallback || null;

    // Safety check: if icon is not a string, it might be a React element or other renderable type
    if (typeof icon !== 'string') {
        return (icon as any) || fallback || null;
    }

    // Type casting to access Lucide icons by string name
    const Icons = LucideIcons as any;

    // Try to find the icon: check direct export, then check if it's under 'icons' or 'default'
    let LucideIcon = Icons[icon];

    // Some versions or build setups might put them under .icons or .default
    if (!LucideIcon && Icons.icons) LucideIcon = Icons.icons[icon];
    if (!LucideIcon && Icons.default && Icons.default[icon]) LucideIcon = Icons.default[icon];

    if (LucideIcon && (typeof LucideIcon === 'function' || typeof LucideIcon === 'object')) {
        return <LucideIcon {...props} />;
    }

    // Check if it's an image URL
    const isImageUrl = icon.startsWith('http') || icon.startsWith('/');

    if (isImageUrl) {
        return (
            <img
                src={icon}
                alt="icon"
                className={props.className}
                style={{
                    width: props.size || 24,
                    height: props.size || 24,
                    objectFit: 'cover',
                    borderRadius: '4px'
                }}
            />
        );
    }

    // Heuristic: If it's a short string (1-3 chars), it's likely an emoji
    // Or if it contains non-ASCII characters
    const isProbablyEmoji = icon.length <= 4 || /[^\x00-\x7F]/.test(icon);

    if (isProbablyEmoji) {
        return (
            <span
                className={props.className}
                style={{
                    fontSize: props.size || '1.5em',
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </span>
        );
    }

    // Default fallback if icon name not found and not an emoji
    return fallback || <span className={props.className}>{icon}</span>;
};
