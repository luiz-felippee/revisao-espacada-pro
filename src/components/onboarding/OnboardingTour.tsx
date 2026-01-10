import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';

export const OnboardingTour: React.FC = () => {
    const {
        isActive,
        currentStep,
        totalSteps,
        currentStepData,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        progress,
    } = useOnboarding();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Update target element position when step changes
    useEffect(() => {
        if (currentStepData?.target) {
            const element = document.querySelector(currentStepData.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                // Scroll into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStepData]);

    if (!isActive) return null;

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const isCenterPlacement = currentStepData?.placement === 'center';

    // Position calculation for tooltip
    const getTooltipStyle = (): React.CSSProperties => {
        if (isCenterPlacement || !targetRect) {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10001,
            };
        }

        const placement = currentStepData?.placement || 'bottom';
        const offset = 20;

        const style: React.CSSProperties = {
            position: 'fixed',
            zIndex: 10001,
        };

        switch (placement) {
            case 'top':
                style.left = targetRect.left + targetRect.width / 2;
                style.top = targetRect.top - offset;
                style.transform = 'translate(-50%, -100%)';
                break;
            case 'bottom':
                style.left = targetRect.left + targetRect.width / 2;
                style.top = targetRect.bottom + offset;
                style.transform = 'translateX(-50%)';
                break;
            case 'left':
                style.left = targetRect.left - offset;
                style.top = targetRect.top + targetRect.height / 2;
                style.transform = 'translate(-100%, -50%)';
                break;
            case 'right':
                style.left = targetRect.right + offset;
                style.top = targetRect.top + targetRect.height / 2;
                style.transform = 'translateY(-50%)';
                break;
        }

        return style;
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[10000] animate-in fade-in duration-300">
                {/* Spotlight effect */}
                {targetRect && !isCenterPlacement && (
                    <div
                        className="absolute border-4 border-blue-500 rounded-2xl animate-pulse"
                        style={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            boxShadow: '0 0 0 4000px rgba(2, 6, 23, 0.8)',
                        }}
                    />
                )}
            </div>

            {/* Tooltip Card */}
            <div
                className="max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-blue-500 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300"
                style={getTooltipStyle()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                Passo {currentStep + 1} de {totalSteps}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {currentStepData?.title}
                        </h3>
                    </div>
                    <button
                        onClick={skipOnboarding}
                        className="text-slate-400 hover:text-white transition-colors ml-2"
                        title="Pular tutorial"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-slate-300 mb-6 leading-relaxed">
                    {currentStepData?.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                    {!isFirstStep && (
                        <button
                            onClick={prevStep}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Voltar
                        </button>
                    )}

                    {isFirstStep && (
                        <button
                            onClick={skipOnboarding}
                            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                            Pular Tutorial
                        </button>
                    )}

                    <button
                        onClick={isLastStep ? completeOnboarding : nextStep}
                        className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {isLastStep ? (
                            <>
                                Finalizar
                                <CheckCircle className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Próximo
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};
