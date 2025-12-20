import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function MetaPixel({ pixelId }) {
  const location = useLocation();

  useEffect(() => {
    if (!pixelId) {
      console.warn('⚠️ Meta Pixel ID not set');
      return;
    }

    console.log('🔵 Meta Pixel initialization started for ID:', pixelId);

    // Define fbq stub BEFORE loading script
    if (!window.fbq) {
      (function(f,b,e,v,n,t,s){
        if(f.fbq) return;
        n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq) f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      console.log('✅ fbq stub function created');
    }

    // Load the Pixel script dynamically
    if (!document.getElementById('facebook-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      script.onload = () => {
        console.log('✅ Meta Pixel script loaded from CDN');
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        console.log(`✅ Pixel initialized and PageView tracked for ID: ${pixelId}`);
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Meta Pixel script:', error);
      };

      document.head.appendChild(script);
      console.log('📌 Script element appended to document.head');
    } else {
      // Script already exists, just init and track
      if (window.fbq) {
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        console.log(`✅ Re-initialized Pixel ID: ${pixelId}`);
      }
    }
  }, [pixelId]);

  // Track page views on route change
  useEffect(() => {
    if (window.fbq && pixelId) {
      window.fbq('track', 'PageView');
      console.log('📊 PageView tracked:', location.pathname);
    }
  }, [location.pathname, pixelId]);

  // Render noscript fallback
  if (!pixelId) return null;

  return (
    <noscript>
      <img 
        height="1" 
        width="1" 
        style={{ display: 'none' }} 
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}