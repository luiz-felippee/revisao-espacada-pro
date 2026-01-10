import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'success' | 'white';
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const variantClasses = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    white: 'text-white',
};

export function LoadingSpinner({ size = 'md', variant = 'primary', className = '' }: LoadingSpinnerProps) {
    return (
        <div
            className={`flex items-center justify-center ${className}`}
            role="status"
            aria-label="Carregando"
        >
            <motion.div
                className={`${sizeClasses[size]} ${variantClasses[variant]}`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </motion.div>
        </div>
    );
}

export function LoadingDots({ variant = 'primary', className = '' }: Omit<LoadingSpinnerProps, 'size'>) {
    const variantColor = {
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        white: 'bg-white',
    };

    return (
        <div className={`flex gap-1 items-center justify-center ${className}`}>
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${variantColor[variant]}`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.2,
                    }}
                />
            ))}
        </div>
    );
}
