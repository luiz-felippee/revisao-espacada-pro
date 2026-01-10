import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Send web vitals to analytics
 */
function sendToAnalytics(metric: Metric) {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(
            `%c[Web Vitals] ${metric.name}`,
            'color: #10b981; font-weight: bold',
            metric
        );
    }

    // In production, send to analytics service
    // Example: Google Analytics, Vercel Analytics, etc.
    if (import.meta.env.PROD) {
        // TODO: Send to analytics
        // gtag('event', metric.name, {
        //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        //   metric_id: metric.id,
        //   metric_value: metric.value,
        //   metric_delta: metric.delta,
        // });
    }
}

/**
 * Initialize web vitals tracking
 */
export function initWebVitals() {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // INP replaces FID in v4
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    console.log('%c📊 Web Vitals tracking initialized', 'color: #3b82f6; font-weight: bold');
}
