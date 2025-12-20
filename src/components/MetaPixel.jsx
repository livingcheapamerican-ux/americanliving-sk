import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function MetaPixel({ pixelId }) {
  const location = useLocation();

  useEffect(() => {
    if (!pixelId) return;

    // Initialize fbq stub function
    if (!window.fbq) {
      window.fbq = function() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
    }

    // Load the Pixel script
    if (!document.getElementById('facebook-pixel-script')) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);

      script.onload = () => {
        console.log('✅ Meta Pixel script loaded');
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
        console.log(`✅ Meta Pixel initialized: ${pixelId}`);
      };

      script.onerror = () => {
        console.error('❌ Failed to load Meta Pixel script');
      };
    } else {
      // Script already loaded, just track
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
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