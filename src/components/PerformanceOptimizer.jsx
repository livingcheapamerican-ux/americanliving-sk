import { useEffect } from "react";

/**
 * Performance Optimizer Component
 * Automaticky optimalizuje výkon stránky
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // 1. Prefetch kritických dát
    const prefetchData = async () => {
      try {
        // Prefetch populárnych domov
        const popularLink = document.createElement('link');
        popularLink.rel = 'prefetch';
        popularLink.href = '/api/entities/Dom?popularny=true';
        document.head.appendChild(popularLink);

        // Prefetch konfigurátorov
        const configLink = document.createElement('link');
        configLink.rel = 'prefetch';
        configLink.href = '/konfigurator';
        document.head.appendChild(configLink);
      } catch (error) {
        console.error('Prefetch error:', error);
      }
    };

    // 2. Lazy load obrázkov mimo viewportu
    const lazyLoadImages = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // 3. Preconnect k externým doménam
    const preconnectDomains = () => {
      const domains = [
        'https://qtrypzzcjebvfcihiynt.supabase.co',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // 4. Optimalizovať animácie
    const optimizeAnimations = () => {
      // Detekcia low-end zariadení
      const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                             navigator.deviceMemory <= 4;

      if (isLowEndDevice) {
        document.documentElement.classList.add('reduce-motion');
      }
    };

    // 5. Defer non-critical JavaScript
    const deferScripts = () => {
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach(script => {
        script.defer = true;
      });
    };

    // 6. Resource hints pre dôležité zdroje
    const addResourceHints = () => {
      // DNS prefetch pre externé domény
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = '//qtrypzzcjebvfcihiynt.supabase.co';
      document.head.appendChild(dnsPrefetch);
    };

    // Spustiť optimalizácie
    prefetchData();
    lazyLoadImages();
    preconnectDomains();
    optimizeAnimations();
    deferScripts();
    addResourceHints();

    // Cleanup
    return () => {
      // Vyčistiť observers
    };
  }, []);

  return null; // Tento komponent nerenduje nič
}