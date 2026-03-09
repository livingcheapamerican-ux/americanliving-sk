import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

const PAGE_NAMES_MAP = {
  '/': 'Domovská stránka', '/katalog': 'Katalóg domov', '/detail-domu': 'Detail domu',
  '/konfigurator': 'Konfigurátor', '/kontakt': 'Kontakt', '/o-nas': 'O nás',
  '/blog': 'Blog', '/faq': 'Často kladené otázky', '/odporucanie-domov': 'AI Odporúčania domov'
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop', isMobile = false;
  if (/mobile/i.test(ua)) { deviceType = 'mobile'; isMobile = true; }
  else if (/tablet|ipad/i.test(ua)) { deviceType = 'tablet'; isMobile = true; }

  let browser = 'Unknown', browserVersion = '';
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) { browser = 'Chrome'; browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || ''; }
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) { browser = 'Safari'; browserVersion = ua.match(/Version\/(\d+)/)?.[1] || ''; }
  else if (/firefox/i.test(ua)) { browser = 'Firefox'; browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || ''; }
  else if (/edge/i.test(ua)) { browser = 'Edge'; browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || ''; }

  let os = 'Unknown', osVersion = '';
  if (/windows/i.test(ua)) { os = 'Windows'; osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || ''; }
  else if (/mac/i.test(ua)) { os = 'macOS'; osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || ''; }
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) { os = 'Android'; osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || ''; }
  else if (/ios|iphone|ipad/i.test(ua)) { os = 'iOS'; osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || ''; }

  return {
    user_agent: ua,
    screen_width: window.screen.width, screen_height: window.screen.height,
    viewport_width: window.innerWidth, viewport_height: window.innerHeight,
    device_type: deviceType, browser, browser_version: browserVersion,
    os, os_version: osVersion, is_mobile: isMobile,
    is_touch: 'ontouchstart' in window,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language, cookie_enabled: navigator.cookieEnabled, online: navigator.onLine
  };
};

// Test if localStorage is available (fails in incognito mode)
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export default function SessionRecorder() {
  const location = useLocation();
  const sessionIdRef = useRef(null);
  const sessionInitializedRef = useRef(false);
  const sessionStartRef = useRef(null);
  const lastPageRef = useRef(null);
  const pageStartTimeRef = useRef(null);
  const clicksRef = useRef([]);
  const scrollEventsRef = useRef([]);
  const scrollDepthRef = useRef({});
  const mouseMovementsRef = useRef(0);
  const mouseHeatmapRef = useRef([]);
  const formInteractionsRef = useRef([]);
  const configuratorInteractionsRef = useRef([]);
  const domInteractionsRef = useRef([]);
  const errorsRef = useRef([]);
  const languageChangesRef = useRef([]);
  const saveTimeoutRef = useRef(null);
  const sessionDbStartTimeRef = useRef(null);
  const localStorageAvailableRef = useRef(isLocalStorageAvailable());

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: Infinity
  });

  // doSave and scheduleSave defined as regular functions (hoisted) so they can be used anywhere
  function doSave(capturedPageEntry = null) {
    if (!sessionIdRef.current) return;

    const currentPage = window.location.pathname + window.location.search;
    const timeOnCurrentPage = pageStartTimeRef.current ? Math.round((Date.now() - pageStartTimeRef.current) / 1000) : 0;
    const startTime = sessionDbStartTimeRef.current || sessionStartRef.current;
    const currentDuration = startTime ? Math.round((Date.now() - new Date(startTime).getTime()) / 1000) : 0;
    const scrollValues = Object.values(scrollDepthRef.current);
    const maxScroll = scrollValues.length > 0 ? Math.max(...scrollValues) : 0;

    const previousSessions = localStorageAvailableRef.current ? localStorage.getItem('user_previous_sessions') : null;
    const tags = [];
    if (currentDuration < 10) tags.push('odrazeny');
    else if (currentDuration > 300) tags.push('velmi_zaujaty');
    else if (currentDuration > 60) tags.push('zaujaty');
    if (previousSessions) tags.push('vracajuci_sa');
    if (formInteractionsRef.current.some(f => f.completed)) tags.push('konvertoval');
    if (configuratorInteractionsRef.current.length > 5) tags.push('pouzivatel_konfiguratora');

    const newPageEntry = capturedPageEntry || {
      page_url: currentPage,
      page_title: document.title,
      page_name_sk: PAGE_NAMES_MAP[window.location.pathname] || document.title,
      timestamp: new Date(pageStartTimeRef.current || Date.now()).toISOString(),
      time_spent_seconds: timeOnCurrentPage,
      scroll_depth_percentage: scrollDepthRef.current[currentPage] || 0,
      exit_type: 'active'
    };

    const updates = {
      duration_seconds: currentDuration,
      mouse_movements: mouseMovementsRef.current,
      mouse_heatmap_data: mouseHeatmapRef.current,
      scroll_depth: { max_percentage: maxScroll, depths_per_page: scrollDepthRef.current },
      scroll_events: scrollEventsRef.current,
      clicks: clicksRef.current,
      form_interactions: formInteractionsRef.current,
      configurator_interactions: configuratorInteractionsRef.current,
      dom_interactions: domInteractionsRef.current,
      errors_encountered: errorsRef.current,
      language_changes: languageChangesRef.current,
      engagement_score: Math.min(100, Math.round((currentDuration / 60) * 10 + (clicksRef.current.length) * 2 + maxScroll / 2)),
      session_tags: tags,
      language: localStorageAvailableRef.current ? localStorage.getItem('language') || 'sk' : 'sk',
      last_activity: new Date().toISOString(),
      current_page: currentPage,
      is_active: true,
      _new_page_entry: newPageEntry
    };

    if (!base44.functions || typeof base44.functions.invoke !== 'function') {
      console.warn('base44.functions.invoke not available, skipping save');
      return;
    }

    base44.functions.invoke('trackUserSession', {
      action: 'update',
      session_id: sessionIdRef.current,
      data: updates
    }).then((res) => {
      if (res?.data?.session_start_time) {
        sessionDbStartTimeRef.current = res.data.session_start_time;
      }
    }).catch(() => {});
  }

  function scheduleSave() {
    if (!sessionIdRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => doSave(), 30000);
  }

  // Initialize session ONCE per page load
  useEffect(() => {
    if (sessionInitializedRef.current || sessionIdRef.current || userLoading) return;
    sessionInitializedRef.current = true;

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = newSessionId;
    sessionStartRef.current = new Date().toISOString();
    // Set pageStartTime immediately so first page is tracked from the start
    pageStartTimeRef.current = Date.now();
    lastPageRef.current = window.location.pathname + window.location.search;
    
    console.log('[SessionRecorder] Initializing session:', newSessionId);

    const previousSessions = localStorageAvailableRef.current ? localStorage.getItem('user_previous_sessions') : null;
    const isReturning = !!previousSessions;
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source'), utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'), utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };
    const referrerUrl = document.referrer || 'direct';
    const referrerDomain = referrerUrl !== 'direct' ? (() => { try { return new URL(referrerUrl).hostname; } catch { return referrerUrl; } })() : 'direct';

    if (!base44.functions || typeof base44.functions.invoke !== 'function') {
      console.error('[SessionRecorder] base44.functions.invoke not available');
      return;
    }

    console.log('[SessionRecorder] Calling trackUserSession with action: create');
    base44.functions.invoke('trackUserSession', {
      action: 'create',
      session_id: newSessionId,
      data: {
        session_id: newSessionId,
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || 'Anonymous',
        is_authenticated: !!user,
        is_returning: isReturning,
        start_time: sessionStartRef.current,
        pages_visited: [], clicks: [], scroll_events: [],
        scroll_depth: {}, mouse_movements: 0, mouse_heatmap_data: [],
        form_interactions: [], configurator_interactions: [],
        dom_interactions: [], errors_encountered: [], language_changes: [],
        device_info: getDeviceInfo(),
        referrer: referrerUrl, referrer_domain: referrerDomain,
        utm_params: utmParams, conversions: [],
        language: localStorage.getItem('language') || 'sk',
        performance_metrics: { avg_page_load_time: 0, slow_pages: [], total_ajax_calls: 0 },
        engagement_score: 0, is_active: true,
        session_tags: isReturning ? ['vracajuci_sa'] : []
      }
    }).then((res) => {
      console.log('[SessionRecorder] Session created successfully:', res);
      if (!sessionIdRef.current) return;
      sessionDbStartTimeRef.current = sessionStartRef.current;

      if (localStorageAvailableRef.current) {
        try {
          const allSessions = JSON.parse(previousSessions || '[]');
          allSessions.push(newSessionId);
          localStorage.setItem('user_previous_sessions', JSON.stringify(allSessions.slice(-10)));
        } catch (err) {}
      }

      // Fetch location - cached 24h (only if localStorage available)
      if (localStorageAvailableRef.current) {
        const cachedLocation = localStorage.getItem('user_location_cache');
        const cacheTimestamp = localStorage.getItem('user_location_cache_time');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;

        if (cachedLocation && cacheAge < 86400000) {
          base44.functions.invoke('trackUserSession', {
            action: 'update_location', session_id: sessionIdRef.current,
            data: JSON.parse(cachedLocation)
          }).catch(() => {});
        } else {
          fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
              if (!sessionIdRef.current) return;
              const locationData = {
                ip: data.ip, country: data.country_name, country_code: data.country_code,
                region: data.region, city: data.city, timezone: data.timezone,
                latitude: data.latitude, longitude: data.longitude
              };
              localStorage.setItem('user_location_cache', JSON.stringify(locationData));
              localStorage.setItem('user_location_cache_time', Date.now().toString());
              base44.functions.invoke('trackUserSession', {
                action: 'update_location', session_id: sessionIdRef.current, data: locationData
              }).catch(() => {});
            }).catch(() => {});
        }
      }

      // Save initial page entry after 5s so we have real time data
      setTimeout(() => doSave(), 5000);
    }).catch(() => {
      sessionIdRef.current = null;
      sessionInitializedRef.current = false;
    });

    const handleStorageChange = (e) => {
      if (e.key === 'language' && e.oldValue !== e.newValue && e.newValue) {
        languageChangesRef.current.push({ from: e.oldValue || '', to: e.newValue, timestamp: new Date().toISOString() });
        scheduleSave();
      }
    };
    const handleError = (e) => {
      errorsRef.current.push({ error_message: e.message, error_stack: e.error?.stack || '', timestamp: new Date().toISOString(), page_url: window.location.pathname });
      scheduleSave();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('error', handleError);
    };
  }, [user, userLoading]);

  // Track page changes
  useEffect(() => {
    if (!sessionIdRef.current) return;
    const currentPage = window.location.pathname + window.location.search;

    // Save the PREVIOUS page's data before switching
    if (lastPageRef.current && pageStartTimeRef.current) {
      const prevPage = lastPageRef.current;
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      const prevPageEntry = {
        page_url: prevPage,
        page_title: document.title,
        page_name_sk: PAGE_NAMES_MAP[prevPage.split('?')[0]] || prevPage,
        timestamp: new Date(pageStartTimeRef.current).toISOString(),
        time_spent_seconds: timeSpent,
        scroll_depth_percentage: scrollDepthRef.current[prevPage] || 0,
        exit_type: 'navigation'
      };
      doSave(prevPageEntry);
    }

    lastPageRef.current = currentPage;
    pageStartTimeRef.current = Date.now();

    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const reachedMilestones = new Set();

    const handleScroll = () => {
      const scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        scrollDepthRef.current[currentPage] = maxScroll;
        scrollMilestones.forEach(milestone => {
          if (scrollPercentage >= milestone && !reachedMilestones.has(milestone)) {
            reachedMilestones.add(milestone);
            scrollEventsRef.current.push({ page_url: currentPage, percentage: milestone, timestamp: new Date().toISOString() });
          }
        });
      }
    };

    const handleClick = (e) => {
      clicksRef.current.push({
        element: e.target.tagName,
        text: e.target.textContent?.substring(0, 100) || '',
        timestamp: new Date().toISOString(),
        page_url: currentPage,
        page_name_sk: PAGE_NAMES_MAP[window.location.pathname] || document.title,
        x_position: e.clientX, y_position: e.clientY,
        element_id: e.target.id || '', element_class: e.target.className || ''
      });
      scheduleSave();
    };

    const handleMouseMove = (e) => {
      mouseMovementsRef.current++;
      if (mouseMovementsRef.current % 50 === 0) {
        mouseHeatmapRef.current.push({ x: e.clientX, y: e.clientY, page_url: currentPage });
        if (mouseHeatmapRef.current.length > 500) mouseHeatmapRef.current = mouseHeatmapRef.current.slice(-500);
      }
    };

    const handleFormFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        const form = e.target.closest('form');
        formInteractionsRef.current.push({
          form_id: form?.id || form?.className || 'unknown_form',
          action: 'field_focus', timestamp: new Date().toISOString(),
          page_url: currentPage,
          fields_touched: [e.target.name || e.target.id || 'unnamed_field'],
          completed: false
        });
      }
    };

    const handleFormSubmit = (e) => {
      formInteractionsRef.current.push({
        form_id: e.target.id || e.target.className || 'unknown_form',
        action: 'submit', timestamp: new Date().toISOString(),
        page_url: currentPage, fields_touched: [], completed: true
      });
      scheduleSave();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('focus', handleFormFocus, true);
    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('focus', handleFormFocus, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [location.pathname, user]);

  // Periodic save every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => doSave(), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => scheduleSave();
    const handleOffline = () => scheduleSave();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // End session on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!sessionIdRef.current || !lastPageRef.current || !pageStartTimeRef.current) return;
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      const startTime = sessionDbStartTimeRef.current || sessionStartRef.current;
      const duration = startTime ? Math.round((Date.now() - new Date(startTime).getTime()) / 1000) : 0;
      const scrollValues = Object.values(scrollDepthRef.current);
      const maxScroll = scrollValues.length > 0 ? Math.max(...scrollValues) : 0;
      const currentPage = window.location.pathname + window.location.search;

      const finalPageEntry = {
        page_url: currentPage, page_title: document.title,
        page_name_sk: PAGE_NAMES_MAP[window.location.pathname] || document.title,
        timestamp: new Date(pageStartTimeRef.current).toISOString(),
        time_spent_seconds: timeSpent,
        scroll_depth_percentage: scrollDepthRef.current[currentPage] || 0,
        exit_type: 'exit'
      };

      const payload = JSON.stringify({
        action: 'update', session_id: sessionIdRef.current,
        data: {
          end_time: new Date().toISOString(), is_active: false, duration_seconds: duration,
          mouse_movements: mouseMovementsRef.current,
          scroll_depth: { max_percentage: maxScroll, depths_per_page: scrollDepthRef.current },
          clicks: clicksRef.current,
          engagement_score: Math.min(100, Math.round((duration / 60) * 10 + (clicksRef.current.length) * 2 + maxScroll / 2)),
          _new_page_entry: finalPageEntry
        }
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/trackUserSession', payload);
      } else {
        base44.functions.invoke('trackUserSession', JSON.parse(payload)).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // Expose global tracking functions
  useEffect(() => {
    window.trackConfiguratorInteraction = (domId, domNazov, action, optionSelected, price, category) => {
      configuratorInteractionsRef.current.push({
        dom_id: domId, dom_nazov: domNazov, action, category,
        option_selected: optionSelected, price_at_time: price,
        timestamp: new Date().toISOString()
      });
      scheduleSave();
    };

    window.trackDomInteraction = (domId, domNazov, action, category) => {
      if (action === 'view_start' || action === 'configurator_open') {
        domInteractionsRef.current.push({
          dom_id: domId, dom_nazov: domNazov, action, category,
          timestamp: new Date().toISOString(), duration_seconds: 0
        });
      } else if (action === 'view_end') {
        const viewStart = domInteractionsRef.current.find(i => i.dom_id === domId && i.action === 'view_start' && !i.duration_seconds);
        if (viewStart) {
          viewStart.duration_seconds = Math.round((Date.now() - new Date(viewStart.timestamp).getTime()) / 1000);
          viewStart.action = 'view';
        }
      }
      scheduleSave();
    };

    window.trackConversion = (type, data, value) => scheduleSave();
  }, []);

  return null;
}