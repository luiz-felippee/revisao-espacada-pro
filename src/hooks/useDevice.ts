import { useState, useEffect } from 'react';

export const useDevice = () => {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();

        // Detect iOS
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Detect Android
        const android = /android/.test(userAgent);
        setIsAndroid(android);

        // Detect PWA Mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        setIsPWA(isStandalone);

    }, []);

    return {
        isIOS,
        isAndroid,
        isPWA,
        isMobile: isIOS || isAndroid,
        // Helper classes for Safe Area
        safeAreaTopClass: isIOS && isPWA ? 'pt-[env(safe-area-inset-top)]' : '',
        safeAreaBottomClass: isIOS && isPWA ? 'pb-[env(safe-area-inset-bottom)]' : '',
    };
};
