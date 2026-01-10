import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector or element ID
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: {
        label: string;
        onClick: () => void;
    };
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Bem-vindo ao Study Panel! 🎓',
        description: 'Vamos fazer um tour rápido pelas principais funcionalidades para você começar a estudar de forma mais eficiente.',
        placement: 'center',
    },
    {
        id: 'dashboard',
        title: 'Este é seu painel central',
        description: 'Aqui você vê suas missões do dia, progresso e estatísticas em tempo real.',
        target: '#dashboard-main',
        placement: 'bottom',
    },
    {
        id: 'srs',
        title: 'Sistema de Revisão Espaçada (SRS) 📚',
        description: 'Revisões otimizadas cientificamente para máxima retenção de conhecimento a longo prazo.',
        target: '#srs-widget',
        placement: 'left',
    },
    {
        id: 'pomodoro',
        title: 'Foque com a técnica Pomodoro 🍅',
        description: '25 minutos de foco intenso seguidos de 5 minutos de pausa. A ciência comprova!',
        target: '#pomodoro-widget',
        placement: 'left',
    },
    {
        id: 'gamification',
        title: 'Ganhe XP e suba de nível! 🏆',
        description: 'Cada minuto focado rende 10 XP. Desbloqueie conquistas e acompanhe seu progresso.',
        target: '#gamification-widget',
        placement: 'left',
    },
    {
        id: 'themes',
        title: 'Organize seus estudos em Temas',
        description: 'Crie temas para suas matérias e subtemas para organizar o conteúdo.',
        target: '[href="/themes"]',
        placement: 'right',
    },
    {
        id: 'projects',
        title: 'Gerencie projetos profissionais 💼',
        description: 'Separe projetos de trabalho dos seus estudos acadêmicos.',
        target: '[href="/projects"]',
        placement: 'right',
    },
    {
        id: 'complete',
        title: 'Você está pronto! 🎉',
        description: 'Explore livremente e aproveite todas as funcionalidades. Bons estudos!',
        placement: 'center',
    },
];

export const useOnboarding = () => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Check if onboarding was completed
    useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        if (completed === 'true') {
            setIsCompleted(true);
        } else {
            // Auto-start onboarding for new users after a short delay
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const skipOnboarding = useCallback(() => {
        setIsActive(false);
        localStorage.setItem('onboarding_completed', 'true');
        setIsCompleted(true);
    }, []);

    const completeOnboarding = useCallback(() => {
        setIsActive(false);
        localStorage.setItem('onboarding_completed', 'true');
        setIsCompleted(true);
    }, []);

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem('onboarding_completed');
        setCurrentStep(0);
        setIsActive(true);
        setIsCompleted(false);
    }, []);

    return {
        isActive,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        currentStepData: TOUR_STEPS[currentStep],
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        resetOnboarding,
        isCompleted,
        progress: ((currentStep + 1) / TOUR_STEPS.length) * 100,
    };
};
