import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

export default function SessionRecorder() {
  const location = useLocation();
  const sessionIdRef = useRef(null);
  const sessionStartRef = useRef(null);
  const lastPageRef = useRef(null);
  const pageStartTimeRef = useRef(null);
  const clicksRef = useRef([]);
  const scrollDepthRef = useRef({});
  const mouseMovementsRef = useRef(0);
  const saveTimeoutRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  // Initialize session
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStartRef.current = new Date().toISOString();
      
      // Detect device info
      const detectDevice = () => {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        if (/mobile/i.test(ua)) deviceType = 'mobile';
        else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

        let browser = 'Unknown';
        if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
        else if (/firefox/i.test(ua)) browser = 'Firefox';
        else if (/edge/i.test(ua)) browser = 'Edge';

        let os = 'Unknown';
        if (/windows/i.test(ua)) os = 'Windows';
        else if (/mac/i.test(ua)) os = 'macOS';
        else if (/linux/i.test(ua)) os = 'Linux';
        else if (/android/i.test(ua)) os = 'Android';
        else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

        return { deviceType, browser, os };
      };

      const { deviceType, browser, os } = detectDevice();

      // Get UTM params
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content')
      };

      // Create session
      base44.entities.UserSession.create({
        session_id: sessionIdRef.current,
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || 'Anonymous',
        is_authenticated: !!user,
        start_time: sessionStartRef.current,
        pages_visited: [],
        clicks: [],
        scroll_depth: {},
        mouse_movements: 0,
        device_info: {
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          device_type: deviceType,
          browser: browser,
          os: os
        },
        referrer: document.referrer || 'direct',
        utm_params: utmParams,
        conversions: [],
        dom_interactions: [],
        language: localStorage.getItem('language') || 'sk',
        is_active: true
      }).catch(err => console.log('Session create error:', err));
    }

    // Track page view
    const currentPage = window.location.pathname + window.location.search;
    const currentTitle = document.title;
    
    if (lastPageRef.current && pageStartTimeRef.current) {
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      // Save previous page data
      scheduleSave({
        pages_visited: [{
          page_url: lastPageRef.current,
          page_title: document.title,
          timestamp: new Date(pageStartTimeRef.current).toISOString(),
          time_spent_seconds: timeSpent
        }]
      });
    }

    lastPageRef.current = currentPage;
    pageStartTimeRef.current = Date.now();

    // Track scroll
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        scrollDepthRef.current[currentPage] = maxScroll;
      }
    };

    // Track clicks
    const handleClick = (e) => {
      const element = e.target.tagName;
      const text = e.target.textContent?.substring(0, 50) || '';
      clicksRef.current.push({
        element,
        text,
        timestamp: new Date().toISOString(),
        page_url: currentPage
      });
      
      scheduleSave({
        clicks: clicksRef.current
      });
    };

    // Track mouse movement (throttled)
    let mouseMoveTimeout;
    const handleMouseMove = () => {
      if (!mouseMoveTimeout) {
        mouseMovementsRef.current++;
        mouseMoveTimeout = setTimeout(() => {
          mouseMoveTimeout = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [location.pathname, user]);

  // Save session data (throttled)
  const scheduleSave = (data) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (!sessionIdRef.current) return;

      base44.entities.UserSession.filter({ session_id: sessionIdRef.current })
        .then(sessions => {
          if (sessions.length > 0) {
            const session = sessions[0];
            const updates = {
              duration_seconds: Math.round((Date.now() - new Date(session.start_time).getTime()) / 1000),
              mouse_movements: mouseMovementsRef.current,
              scroll_depth: {
                max_percentage: Math.max(...Object.values(scrollDepthRef.current)),
                depths_per_page: scrollDepthRef.current
              }
            };

            if (data.pages_visited) {
              updates.pages_visited = [...(session.pages_visited || []), ...data.pages_visited];
            }
            if (data.clicks) {
              updates.clicks = data.clicks;
            }

            base44.entities.UserSession.update(session.id, updates)
              .catch(err => console.log('Session update error:', err));
          }
        })
        .catch(err => console.log('Session fetch error:', err));
    }, 2000);
  };

  // End session on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
        
        navigator.sendBeacon('/api/session-end', JSON.stringify({
          session_id: sessionIdRef.current,
          last_page: lastPageRef.current,
          time_spent: timeSpent
        }));

        base44.entities.UserSession.filter({ session_id: sessionIdRef.current })
          .then(sessions => {
            if (sessions.length > 0) {
              base44.entities.UserSession.update(sessions[0].id, {
                end_time: new Date().toISOString(),
                is_active: false,
                duration_seconds: Math.round((Date.now() - sessionStartRef.current) / 1000)
              }).catch(() => {});
            }
          });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null;
}