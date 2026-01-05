import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function MetaPixel({ pixelId }) {
  const location = useLocation();

  useEffect(() => {
    if (!pixelId) return;

    // Standard Facebook Pixel code - programmatically injected
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){
        n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
      };
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];
      t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

    if (!window._fbPixelInitialized) {
      window.fbq('init', pixelId);
      window._fbPixelInitialized = true;
    }
    window.fbq('track', 'PageView');
  }, [pixelId]);

  // Track page changes
  useEffect(() => {
    if (window.fbq && pixelId) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, pixelId]);

  return null;
}