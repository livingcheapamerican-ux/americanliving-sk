import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { appParams } from "@/lib/app-params";

const getCookie = (name) => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  } catch (e) {}
  return null;
};

const setCookie = (name, value, days) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  } catch (e) {}
};

const PAGE_NAMES_MAP = {
  '/': 'Domovská stránka', '/Domov': 'Domovská stránka',
  '/Katalog': 'Katalóg domov', '/KatalogRodinneDomy': 'Katalóg – Rodinné domy',
  '/KatalogMobilneDomy': 'Katalóg – Mobilné domy', '/KatalogModularneDomy': 'Katalóg – Modulárne domy',
  '/KatalogMontovaneDomy': 'Katalóg – Montované domy', '/KatalogTicabHouse': 'Katalóg – Ticab House',
  '/KatalogProstoHouse': 'Katalóg – Prosto House', '/KatalogDomkiZGor': 'Katalóg – Domki z Gór',
  '/DetailDomu': 'Detail domu', '/Konfigurator': 'Konfigurátor',
  '/KonfiguratorTicabhouse': 'Konfigurátor – Ticab House',
  '/KonfiguratorProstoHouse': 'Konfigurátor – Prosto House',
  '/Kalkulacka': 'Kalkulačka hypotéky',
  '/Kontakt': 'Kontakt', '/ONas': 'O nás', '/Blog': 'Blog', '/BlogDetail': 'Blog – článok',
  '/FAQ': 'Často kladené otázky', '/OdporucanieDomov': 'AI Odporúčania domov',
  '/DotaciaAmericana': 'Dotácia Americana', '/GaleriaRealizacii': 'Galéria realizácií',
  '/MojeKonto': 'Moje konto', '/MojaPonuka': 'Moja ponuka'
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

  // --- ADVANCED TRACKING REFS ---
  const visitorIdRef = useRef(null);
  const sessionNumberRef = useRef(1);
  const sectionTimersRef = useRef({});
  const sectionEngagementRef = useRef({});
  const exitSectionRef = useRef(null);
  const tabHiddenTimeRef = useRef(0);
  const lastHiddenTimestampRef = useRef(null);

  const activeDurationSecondsRef = useRef(0);
  const lastActiveTimestampRef = useRef(Date.now());
  const idleTimeoutIdRef = useRef(null);
  const isIdleRef = useRef(false);
  
  const rageClicksRef = useRef([]);
  const recentClicksHistoryRef = useRef([]);
  const deadClicksRef = useRef([]);
  
  const fieldTimersRef = useRef({});
  const webVitalsRef = useRef({ lcp: 0, cls: 0, fid: 0, ttfb: 0, recorded: false });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: Infinity
  });

  // ACTIVITY MONITORING (IDLE TIME)
  const updateActiveTime = () => {
    const now = Date.now();
    if (!isIdleRef.current) {
      const diff = Math.round((now - lastActiveTimestampRef.current) / 1000);
      if (diff > 0) {
        activeDurationSecondsRef.current += diff;
      }
    }
    lastActiveTimestampRef.current = now;
    isIdleRef.current = false;
    
    if (idleTimeoutIdRef.current) clearTimeout(idleTimeoutIdRef.current);
    idleTimeoutIdRef.current = setTimeout(() => {
      isIdleRef.current = true;
    }, 15000); // 15s of no mouse movement/keys = idle
  };

  function doSave(capturedPageEntry = null) {
    if (!sessionIdRef.current) return;
    
    // Ak sme admin, neukladáme session do databázy (ochrana kreditov a štatistík)
    if (
      (localStorageAvailableRef.current && localStorage.getItem('base44_is_admin') === 'true') ||
      user?.role === 'admin' ||
      user?.super_admin === true ||
      user?.email === 'living.cheap.american@gmail.com'
    ) {
      if (localStorageAvailableRef.current && localStorage.getItem('base44_is_admin') !== 'true') {
        localStorage.setItem('base44_is_admin', 'true');
      }
      return;
    }
    
    // Pred uložením vždy aktualizujeme aktívny čas
    updateActiveTime();

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
    if (previousSessions || sessionNumberRef.current > 1) {
      if (!tags.includes('vracajuci_sa')) tags.push('vracajuci_sa');
    }
    if (formInteractionsRef.current.some(f => f.completed)) tags.push('konvertoval');
    if (configuratorInteractionsRef.current.length > 5) tags.push('pouzivatel_konfiguratora');
    if (rageClicksRef.current.length > 0) tags.push('frustrovany_rage_clicks');

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
      visitor_id: visitorIdRef.current, // NEW
      session_number: sessionNumberRef.current, // NEW
      section_engagement: sectionEngagementRef.current, // NEW
      exit_page: currentPage, // NEW
      exit_section: exitSectionRef.current, // NEW
      tab_hidden_time_seconds: tabHiddenTimeRef.current, // NEW
      duration_seconds: currentDuration,
      active_duration_seconds: activeDurationSecondsRef.current,
      performance_metrics: webVitalsRef.current,
      rage_clicks: rageClicksRef.current,
      dead_clicks: deadClicksRef.current,
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
      engagement_score: Math.min(100, Math.round((activeDurationSecondsRef.current / 60) * 10 + (clicksRef.current.length) * 2 + maxScroll / 2)),
      session_tags: tags,
      language: localStorageAvailableRef.current ? localStorage.getItem('language') || 'sk' : 'sk',
      last_activity: new Date().toISOString(),
      current_page: currentPage,
      is_active: true,
      _new_page_entry: newPageEntry
    };

    if (!base44.functions || typeof base44.functions.invoke !== 'function') return;

    base44.functions.invoke('trackUserSession', {
      action: 'update',
      session_id: sessionIdRef.current,
      data: updates
    }).then((res) => {
      if (res?.data?.session_start_time) sessionDbStartTimeRef.current = res.data.session_start_time;
    }).catch(() => {});
  }

  function scheduleSave() {
    if (!sessionIdRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => doSave(), 45000); // 45s pre šetrenie kreditov
  }

  // CORE INIT & WEB VITALS
  useEffect(() => {
    // 1. Ak sme prihlásený admin alebo máme admin príznak v úložisku, ignorujeme SessionRecorder
    if (
      (localStorageAvailableRef.current && localStorage.getItem('base44_is_admin') === 'true') ||
      user?.role === 'admin' ||
      user?.super_admin === true ||
      user?.email === 'living.cheap.american@gmail.com'
    ) {
      if (localStorageAvailableRef.current && localStorage.getItem('base44_is_admin') !== 'true') {
        localStorage.setItem('base44_is_admin', 'true');
      }
      console.log('🛡️ Admin bypass active: skipping SessionRecorder initialization.');
      return;
    }

    if (sessionInitializedRef.current || sessionIdRef.current || userLoading) return;
    sessionInitializedRef.current = true;

    // 2. Spracovanie Visitor ID (prioritne cookie pre medzidoménovú persistenciu, fallback localStorage)
    let visitorId = getCookie('visitor_id');
    if (!visitorId && localStorageAvailableRef.current) {
      visitorId = localStorage.getItem('visitor_id');
    }
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    visitorIdRef.current = visitorId;
    setCookie('visitor_id', visitorId, 365); // 1 rok platnosť cookie
    if (localStorageAvailableRef.current) {
      localStorage.setItem('visitor_id', visitorId);
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = newSessionId;
    sessionStartRef.current = new Date().toISOString();
    pageStartTimeRef.current = Date.now();
    lastPageRef.current = window.location.pathname + window.location.search;
    lastActiveTimestampRef.current = Date.now();

    // 3. Spracovanie čísla návštevy (session_number)
    let sessionNumber = 1;
    if (localStorageAvailableRef.current) {
      try {
        const storedSessions = localStorage.getItem('visitor_sessions_list');
        const list = JSON.parse(storedSessions || '[]');
        if (!list.includes(newSessionId)) {
          list.push(newSessionId);
          localStorage.setItem('visitor_sessions_list', JSON.stringify(list.slice(-100)));
        }
        sessionNumber = list.length;
      } catch (err) {}
    }
    sessionNumberRef.current = sessionNumber;

    // WEB VITALS COLLECTION
    try {
      if (typeof PerformanceObserver !== 'undefined') {
        const obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              webVitalsRef.current.lcp = Math.round(entry.startTime);
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              webVitalsRef.current.cls += entry.value;
            }
            if (entry.entryType === 'first-input') {
              webVitalsRef.current.fid = Math.round(entry.processingStart - entry.startTime);
            }
            if (entry.entryType === 'navigation') {
              webVitalsRef.current.ttfb = Math.round(entry.responseStart);
            }
          }
          webVitalsRef.current.recorded = true;
        });
        obs.observe({ type: 'largest-contentful-paint', buffered: true });
        obs.observe({ type: 'layout-shift', buffered: true });
        obs.observe({ type: 'first-input', buffered: true });
        obs.observe({ type: 'navigation', buffered: true });
      }
    } catch (e) { console.warn("PerformanceObserver not supported", e); }

    const previousSessions = localStorageAvailableRef.current ? localStorage.getItem('user_previous_sessions') : null;
    const isReturning = !!previousSessions || sessionNumber > 1;
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source'), utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'), utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };
    const referrerUrl = document.referrer || 'direct';
    const referrerDomain = referrerUrl !== 'direct' ? (() => { try { return new URL(referrerUrl).hostname; } catch { return referrerUrl; } })() : 'direct';

    if (!base44.functions || typeof base44.functions.invoke !== 'function') return;

    base44.functions.invoke('trackUserSession', {
      action: 'create',
      session_id: newSessionId,
      data: {
        session_id: newSessionId,
        visitor_id: visitorId, // NEW
        session_number: sessionNumber, // NEW
        user_email: user?.email || 'anonymous',
        user_name: user?.full_name || 'Anonymous',
        is_authenticated: !!user,
        is_returning: isReturning,
        start_time: sessionStartRef.current,
        pages_visited: [], clicks: [], scroll_events: [],
        scroll_depth: {}, mouse_movements: 0, mouse_heatmap_data: [],
        form_interactions: [], configurator_interactions: [],
        dom_interactions: [], errors_encountered: [], language_changes: [],
        rage_clicks: [], dead_clicks: [],
        active_duration_seconds: 0,
        device_info: getDeviceInfo(),
        referrer: referrerUrl, referrer_domain: referrerDomain,
        utm_params: utmParams, conversions: [],
        language: localStorage.getItem('language') || 'sk',
        performance_metrics: webVitalsRef.current,
        engagement_score: 0, is_active: true,
        session_tags: isReturning ? ['vracajuci_sa'] : []
      }
    }).then((res) => {
      if (!sessionIdRef.current) return;
      sessionDbStartTimeRef.current = sessionStartRef.current;

      if (localStorageAvailableRef.current) {
        try {
          const allSessions = JSON.parse(previousSessions || '[]');
          if (!allSessions.includes(newSessionId)) {
            allSessions.push(newSessionId);
            localStorage.setItem('user_previous_sessions', JSON.stringify(allSessions.slice(-10)));
          }
        } catch (err) {}
      }

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
          // Fallback sequence pre určovanie polohy
          const fetchLocation = async () => {
            try {
              // 1. Pokus: ipapi.co
              const res = await fetch('https://ipapi.co/json/');
              if (!res.ok) throw new Error('ipapi.co zlyhal');
              const data = await res.json();
              if (data.error) throw new Error(data.reason || 'ipapi.co vratil chybu');
              return {
                ip: data.ip, country: data.country_name, country_code: data.country_code,
                region: data.region, city: data.city, timezone: data.timezone,
                latitude: data.latitude, longitude: data.longitude
              };
            } catch (err) {
              console.warn("ipapi.co failed, trying freeipapi.com...", err);
              try {
                // 2. Pokus: freeipapi.com (bezplatny fallback, s HTTPS)
                const res = await fetch('https://freeipapi.com/api/json');
                if (!res.ok) throw new Error('freeipapi.com zlyhal');
                const data = await res.json();
                return {
                  ip: data.ipAddress, country: data.countryName, country_code: data.countryCode,
                  region: data.regionName, city: data.cityName, timezone: data.timeZone,
                  latitude: data.latitude, longitude: data.longitude
                };
              } catch (err2) {
                console.warn("freeipapi.com failed, trying ipinfo.io...", err2);
                try {
                  // 3. Pokus: ipinfo.io
                  const res = await fetch('https://ipinfo.io/json');
                  if (!res.ok) throw new Error('ipinfo.io zlyhal');
                  const data = await res.json();
                  const [lat, lng] = (data.loc || "0,0").split(",").map(Number);
                  return {
                    ip: data.ip, country: data.country, country_code: data.country,
                    region: data.region, city: data.city, timezone: data.timezone,
                    latitude: lat, longitude: lng
                  };
                } catch (err3) {
                  console.error("All location APIs failed", err3);
                  return null;
                }
              }
            }
          };

          fetchLocation().then(locationData => {
            if (!locationData || !sessionIdRef.current) return;
            localStorage.setItem('user_location_cache', JSON.stringify(locationData));
            localStorage.setItem('user_location_cache_time', Date.now().toString());
            base44.functions.invoke('trackUserSession', {
              action: 'update_location', session_id: sessionIdRef.current, data: locationData
            }).catch(() => {});
          });
        }
      }

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
    
     // VISIBILITY API PRE ACTIVE TIME
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActiveTime();
        isIdleRef.current = true;
        lastHiddenTimestampRef.current = Date.now();
      } else {
        lastActiveTimestampRef.current = Date.now();
        isIdleRef.current = false;
        if (lastHiddenTimestampRef.current) {
          const hiddenMs = Date.now() - lastHiddenTimestampRef.current;
          tabHiddenTimeRef.current += Math.round(hiddenMs / 1000);
          lastHiddenTimestampRef.current = null;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('error', handleError);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('error', handleError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, userLoading]);

  // TRACK PAGE CHANGES & USER EVENTS
  useEffect(() => {
    if (!sessionIdRef.current) return;
    const currentPage = window.location.pathname + window.location.search;

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

    // 1. Nastavenie IntersectionObserver pre čítanie sekcií
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (!id) return;
        
        if (entry.isIntersecting) {
          // Používateľ začal vidieť sekciu
          sectionTimersRef.current[id] = Date.now();
        } else {
          // Používateľ opustil sekciu
          const startTime = sectionTimersRef.current[id];
          if (startTime) {
            const durationMs = Date.now() - startTime;
            const durationSec = Math.round(durationMs / 1000);
            if (durationSec > 0) {
              sectionEngagementRef.current[id] = (sectionEngagementRef.current[id] || 0) + durationSec;
              exitSectionRef.current = id;
              scheduleSave();
            }
            delete sectionTimersRef.current[id];
          }
        }
      });
    }, { threshold: 0.3 }); // 30% viditeľnosti stačí

    // Sledujeme elementy s ID po krátkom zdržaní (SPA načítanie)
    const observerTimeout = setTimeout(() => {
      const elements = document.querySelectorAll('section[id], div[id], [data-track-section]');
      elements.forEach(el => {
        if (el.id && !['root', 'app', 'portal', 'tailwind-indicator'].includes(el.id)) {
          observer.observe(el);
        }
      });
    }, 1500);

    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const reachedMilestones = new Set();

    const handleScroll = () => {
      updateActiveTime();
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
      updateActiveTime();
      const rawClass = e.target.className;
      const elementClass = typeof rawClass === 'string' ? rawClass : (rawClass?.baseVal || '');
      const clickTime = Date.now();
      const tag = e.target.tagName || '';
      
      const newClick = {
        element: tag,
        text: e.target.textContent?.substring(0, 50) || '',
        timestamp: new Date().toISOString(),
        page_url: currentPage,
        x_position: e.clientX, y_position: e.clientY,
        x_percent: Math.round((e.clientX / window.innerWidth) * 100), // Percentuálna pozícia
        y_percent: Math.round((e.clientY / window.innerHeight) * 100), // Percentuálna pozícia
        element_id: e.target.id || '', element_class: elementClass
      };
      
      clicksRef.current.push(newClick);

      // --- DEAD CLICKS DETECTION ---
      const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'SUMMARY', 'VIDEO', 'AUDIO'];
      const hasInteractiveRole = e.target.getAttribute('role') === 'button' || e.target.getAttribute('role') === 'link';
      const isInteractiveParent = e.target.closest('a') || e.target.closest('button');
      
      if (!interactiveTags.includes(tag) && !hasInteractiveRole && !isInteractiveParent) {
        deadClicksRef.current.push({
          ...newClick,
          reason: 'Non-interactive element clicked'
        });
      }

      // --- RAGE CLICKS DETECTION ---
      recentClicksHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: clickTime });
      recentClicksHistoryRef.current = recentClicksHistoryRef.current.filter(c => clickTime - c.time < 1500);
      
      if (recentClicksHistoryRef.current.length >= 3) {
        const xs = recentClicksHistoryRef.current.map(c => c.x);
        const ys = recentClicksHistoryRef.current.map(c => c.y);
        const maxDistX = Math.max(...xs) - Math.min(...xs);
        const maxDistY = Math.max(...ys) - Math.min(...ys);
        
        if (maxDistX < 50 && maxDistY < 50) {
           rageClicksRef.current.push({
             element: tag, element_id: newClick.element_id, 
             page_url: currentPage, timestamp: new Date().toISOString()
           });
           recentClicksHistoryRef.current = [];
        }
      }

      scheduleSave();
    };

    const handleMouseMove = (e) => {
      updateActiveTime();
      mouseMovementsRef.current++;
      if (mouseMovementsRef.current % 50 === 0) {
        mouseHeatmapRef.current.push({ x: e.clientX, y: e.clientY, page_url: currentPage });
        if (mouseHeatmapRef.current.length > 500) mouseHeatmapRef.current = mouseHeatmapRef.current.slice(-500);
      }
    };

    const handleKeyDown = () => updateActiveTime();

    // --- ENHANCED FORM TRACKING ---
    const handleFormFocus = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        const fieldName = e.target.name || e.target.id || 'unnamed_field';
        fieldTimersRef.current[fieldName] = Date.now();
      }
    };

    const handleFormBlur = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        const fieldName = e.target.name || e.target.id || 'unnamed_field';
        const startTime = fieldTimersRef.current[fieldName];
        if (startTime) {
          const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
          const form = e.target.closest('form');
          
          let formInteraction = formInteractionsRef.current.find(f => f.form_id === (form?.id || form?.className || 'unknown_form'));
          if (!formInteraction) {
            formInteraction = {
              form_id: form?.id || form?.className || 'unknown_form',
              action: 'filling', timestamp: new Date().toISOString(),
              page_url: currentPage, fields_touched: [], completed: false,
              total_struggle_time: 0
            };
            formInteractionsRef.current.push(formInteraction);
          }
          
          if (!formInteraction.fields_touched.includes(fieldName)) {
            formInteraction.fields_touched.push(fieldName);
          }
          formInteraction.total_struggle_time = (formInteraction.total_struggle_time || 0) + timeSpentSeconds;
          delete fieldTimersRef.current[fieldName];
        }
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
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    document.addEventListener('focus', handleFormFocus, true);
    document.addEventListener('blur', handleFormBlur, true);
    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      clearTimeout(observerTimeout);
      observer.disconnect();
      // Uložíme bežiace časy pre sekcie
      Object.entries(sectionTimersRef.current).forEach(([id, startTime]) => {
        const diffSec = Math.round((Date.now() - startTime) / 1000);
        if (diffSec > 0) {
          sectionEngagementRef.current[id] = (sectionEngagementRef.current[id] || 0) + diffSec;
          exitSectionRef.current = id;
        }
      });
      sectionTimersRef.current = {};

      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focus', handleFormFocus, true);
      document.removeEventListener('blur', handleFormBlur, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [location.pathname, location.search, user]);

  // Periodic save every 60 seconds for accuracy (šetrenie kreditov)
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
      
      // Ak sme admin, neukladáme session do databázy (ochrana kreditov a štatistík)
      if (
        (localStorageAvailableRef.current && localStorage.getItem('base44_is_admin') === 'true') ||
        user?.role === 'admin' ||
        user?.super_admin === true ||
        user?.email === 'living.cheap.american@gmail.com'
      ) {
        return;
      }

      updateActiveTime(); // Final time sync
      
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
          visitor_id: visitorIdRef.current,
          session_number: sessionNumberRef.current,
          section_engagement: sectionEngagementRef.current,
          exit_page: currentPage,
          exit_section: exitSectionRef.current,
          tab_hidden_time_seconds: tabHiddenTimeRef.current,
          end_time: new Date().toISOString(), is_active: false, duration_seconds: duration,
          active_duration_seconds: activeDurationSecondsRef.current,
          mouse_movements: mouseMovementsRef.current,
          rage_clicks: rageClicksRef.current,
          dead_clicks: deadClicksRef.current,
          scroll_depth: { max_percentage: maxScroll, depths_per_page: scrollDepthRef.current },
          clicks: clicksRef.current,
          performance_metrics: webVitalsRef.current,
          engagement_score: Math.min(100, Math.round((activeDurationSecondsRef.current / 60) * 10 + (clicksRef.current.length) * 2 + maxScroll / 2)),
          _new_page_entry: finalPageEntry
        }
      });

      const url = `${appParams.serverUrl}/api/apps/public/functions/v1/trackUserSession`;
      const headers = {
        'Content-Type': 'application/json',
        'X-App-Id': appParams.appId
      };
      if (appParams.token) {
        headers['Authorization'] = `Bearer ${appParams.token}`;
      }

      try {
        fetch(url, {
          method: 'POST',
          headers,
          body: payload,
          keepalive: true
        });
      } catch (e) {
        // Fallback ak moderný keepalive fetch zlyhá
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/trackUserSession', payload);
        }
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