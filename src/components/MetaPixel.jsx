import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function MetaPixel({ pixelId }) {
  const location = useLocation();
  const firedLeadSessions = useRef(new Set());
  const firedViewSessions = useRef(new Set());

  // Initialize pixel
  useEffect(() => {
    if (!pixelId) return;

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

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    console.log('✅ Meta Pixel initialized:', pixelId);
  }, [pixelId]);

  // Track page changes
  useEffect(() => {
    if (window.fbq && pixelId) {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, pixelId]);

  // Track ViewContent when user visits a house detail page
  useEffect(() => {
    if (!pixelId || !window.fbq) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const domId = urlParams.get('domId') || urlParams.get('id');
    const isDetailPage = location.pathname.includes('detail') || location.pathname.includes('dom');
    
    if (isDetailPage && domId && !firedViewSessions.current.has(domId)) {
      firedViewSessions.current.add(domId);
      window.fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids: [domId],
        content_category: 'modularne_domy'
      });
      console.log('📊 Meta Pixel: ViewContent fired for house', domId);
    }
  }, [location.pathname, location.search, pixelId]);

  // Auto-send Lead events from conversions in sessions (via CAPI)
  useEffect(() => {
    if (!pixelId) return;

    const checkConversions = async () => {
      try {
        const sessions = await base44.entities.UserSession.list('-created_date', 50);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        sessions.forEach(session => {
          if (!session.conversions?.length) return;
          if (new Date(session.created_date) < todayStart) return;
          if (firedLeadSessions.current.has(session.id)) return;

          firedLeadSessions.current.add(session.id);

          // Browser-side pixel event
          if (window.fbq) {
            window.fbq('track', 'Lead', {
              content_category: 'form_submission',
              content_name: 'Dopyt'
            });
            console.log('📊 Meta Pixel: Lead fired for session', session.id);
          }

          // Server-side CAPI event
          base44.functions.invoke('sendCAPIEvent', {
            event_name: 'Lead',
            event_source_url: session.pages_visited?.[0]?.page_url || window.location.href,
            user_data: {
              client_user_agent: session.device_info?.user_agent || navigator.userAgent,
              client_ip_address: session.location_info?.ip
            }
          }).catch(e => console.warn('CAPI Lead send failed:', e));
        });
      } catch (e) {
        // Silent fail — pixel tracking should never break the app
      }
    };

    // Run once on load, then every 5 minutes
    checkConversions();
    const interval = setInterval(checkConversions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pixelId]);

  return null;
}