'use client';

import { useEffect } from 'react';
import { performanceMonitoring } from '@/utils/performance';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Measure Core Web Vitals
    performanceMonitoring.measureWebVitals();

    // Measure page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      console.log('Page Load Time:', loadTime);
      
      // Send to analytics if needed
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_load_time', {
          value: Math.round(loadTime),
          custom_parameter: 'performance'
        });
      }
    };

    // Measure when page is fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Measure resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 1000) { // Log slow resources
            console.log('Slow resource:', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Measure memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        });
      }
    };

    // Measure memory every 30 seconds
    const memoryInterval = setInterval(measureMemory, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}
