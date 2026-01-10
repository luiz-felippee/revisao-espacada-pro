import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedContainerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'none';
    delay?: number;
    duration?: number;
    className?: string;
}

const animations = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    'slide-up': {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    'slide-down': {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    'slide-left': {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    },
    'slide-right': {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    },
    none: {
        initial: {},
        animate: {},
        exit: {},
    },
};

export function AnimatedContainer({
    children,
    animation = 'fade',
    delay = 0,
    duration = 0.3,
    className,
    ...props
}: AnimatedContainerProps) {
    const selectedAnimation = animations[animation];

    return (
        <motion.div
            initial={selectedAnimation.initial}
            animate={selectedAnimation.animate}
            exit={selectedAnimation.exit}
            transition={{
                duration,
                delay,
                ease: [0.4, 0, 0.2, 1], // Custom easing for smooth feel
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}
