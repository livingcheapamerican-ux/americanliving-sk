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
  const lastSaveRef = useRef(Date.now());

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me().catch(() => null),
    staleTime: Infinity
  });

  // Detect device info
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    let isMobile = false;
    if (/mobile/i.test(ua)) { deviceType = 'mobile'; isMobile = true; }
    else if (/tablet|ipad/i.test(ua)) { deviceType = 'tablet'; isMobile = true; }

    let browser = 'Unknown';
    let browserVersion = '';
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) {
      browser = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      browser = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
    } else if (/firefox/i.test(ua)) {
      browser = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (/edge/i.test(ua)) {
      browser = 'Edge';
      browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
    }

    let os = 'Unknown';
    let osVersion = '';
    if (/windows/i.test(ua)) {
      os = 'Windows';
      osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '';
    } else if (/mac/i.test(ua)) {
      os = 'macOS';
      osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    } else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) {
      os = 'Android';
      osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || '';
    } else if (/ios|iphone|ipad/i.test(ua)) {
      os = 'iOS';
      osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
    }

    return {
      user_agent: ua,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_type: deviceType,
      browser: browser,
      browser_version: browserVersion,
      os: os,
      os_version: osVersion,
      is_mobile: isMobile,
      is_touch: 'ontouchstart' in window,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookie_enabled: navigator.cookieEnabled,
      online: navigator.onLine
    };
  };

  // Initialize session ONCE per page load
  useEffect(() => {
    // Skip if already has session ID or still loading user
    if (sessionIdRef.current || userLoading) {
      if (userLoading) {
        console.log('⏸️ SessionRecorder: Čakám na načítanie user...');
      }
      return;
    }
    
    console.log('🚀 SessionRecorder: START - Inicializujem novú session', { 
      user: user?.email || 'anonymous',
      url: window.location.href
    });
    
    // Create new session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = newSessionId;
    sessionStartRef.current = new Date().toISOString();
    
    console.log('🆕 SessionRecorder: Nové Session ID vytvorené:', sessionIdRef.current);
    
    const previousSessions = localStorage.getItem('user_previous_sessions');
    const isReturning = !!previousSessions;
    
    console.log('📜 Previous sessions:', previousSessions ? JSON.parse(previousSessions).length : 0);
      
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };
    
    console.log('📊 UTM Parametre detegované:', utmParams);

    const referrerUrl = document.referrer || 'direct';
    const referrerDomain = referrerUrl !== 'direct' ? new URL(referrerUrl).hostname : 'direct';
    
    console.log('🔗 Referrer info:', { referrerUrl, referrerDomain });

    const pageNamesMap = {
      '/': 'Domovská stránka',
      '/katalog': 'Katalóg domov',
      '/detail-domu': 'Detail domu',
      '/konfigurator': 'Konfigurátor',
      '/kontakt': 'Kontakt',
      '/o-nas': 'O nás',
      '/blog': 'Blog',
      '/faq': 'Často kladené otázky',
      '/odporucanie-domov': 'AI Odporúčania domov'
    };

    console.log('💾 SessionRecorder: Ukladám novú session do databázy...');

    base44.entities.UserSession.create({
      session_id: sessionIdRef.current,
      user_email: user?.email || 'anonymous',
      user_name: user?.full_name || 'Anonymous',
      is_authenticated: !!user,
      is_returning: isReturning,
      start_time: sessionStartRef.current,
      pages_visited: [],
      clicks: [],
      scroll_events: [],
      scroll_depth: {},
      mouse_movements: 0,
      mouse_heatmap_data: [],
      form_interactions: [],
      configurator_interactions: [],
      dom_interactions: [],
      errors_encountered: [],
      language_changes: [],
      device_info: getDeviceInfo(),
      referrer: referrerUrl,
      referrer_domain: referrerDomain,
      utm_params: utmParams,
      conversions: [],
      language: localStorage.getItem('language') || 'sk',
      performance_metrics: {
        avg_page_load_time: 0,
        slow_pages: [],
        total_ajax_calls: 0
      },
      engagement_score: 0,
      is_active: true,
      session_tags: isReturning ? ['vracajuci_sa'] : []
    }).then((created) => {
      console.log('✅ SessionRecorder: Session ÚSPEŠNE vytvorená v DB!', {
        session_id: sessionIdRef.current,
        created_id: created?.id,
        user: user?.email || 'anonymous',
        utm_params: utmParams,
        referrer: referrerUrl,
        timestamp: new Date().toISOString()
      });
      
      const allSessions = JSON.parse(previousSessions || '[]');
      allSessions.push(sessionIdRef.current);
      localStorage.setItem('user_previous_sessions', JSON.stringify(allSessions.slice(-10)));
      
      // Fetch location info
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          console.log('📍 Location info získaná:', data.city, data.country_code);
          base44.entities.UserSession.filter({ session_id: sessionIdRef.current })
            .then(sessions => {
              if (sessions.length > 0) {
                base44.entities.UserSession.update(sessions[0].id, {
                  location_info: {
                    ip: data.ip,
                    country: data.country_name,
                    country_code: data.country_code,
                    region: data.region,
                    city: data.city,
                    timezone: data.timezone,
                    latitude: data.latitude,
                    longitude: data.longitude
                  }
                }).then(() => console.log('✅ Location info uložená do DB'));
              }
            });
        })
        .catch(err => console.log('⚠️ Location fetch failed:', err));
    }).catch(err => {
      console.error('❌ CRITICAL: SessionRecorder vytvorenie zlyhalo!', err);
      sessionIdRef.current = null; // Reset aby sa mohlo skúsiť znova
    });

      window.addEventListener('error', (e) => {
        errorsRef.current.push({
          error_message: e.message,
          error_stack: e.error?.stack || '',
          timestamp: new Date().toISOString(),
          page_url: window.location.pathname
        });
        scheduleSave();
      });

      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === 'language') {
          const oldLang = localStorage.getItem('language');
          if (oldLang && oldLang !== value) {
            languageChangesRef.current.push({
              from: oldLang,
              to: value,
              timestamp: new Date().toISOString()
            });
            scheduleSave();
          }
        }
        originalSetItem.apply(this, arguments);
      };
    }

    // Attach global event listeners
    window.addEventListener('error', (e) => {
      errorsRef.current.push({
        error_message: e.message,
        error_stack: e.error?.stack || '',
        timestamp: new Date().toISOString(),
        page_url: window.location.pathname
      });
      scheduleSave();
    });

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'language') {
        const oldLang = localStorage.getItem('language');
        if (oldLang && oldLang !== value) {
          languageChangesRef.current.push({
            from: oldLang,
            to: value,
            timestamp: new Date().toISOString()
          });
          scheduleSave();
        }
      }
      originalSetItem.apply(this, arguments);
    };
  }, [user, userLoading]);

  // Track page changes
  useEffect(() => {
    if (!sessionIdRef.current) {
      console.log('⚠️ Page change tracking: Session ešte nie je inicializovaná');
      return;
    }

    const currentPage = window.location.pathname + window.location.search;
    const currentTitle = document.title;
    
    console.log('📄 Page change detegovaná:', currentPage);
    
    if (lastPageRef.current && pageStartTimeRef.current) {
      const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      const maxScrollForPage = scrollDepthRef.current[lastPageRef.current] || 0;
      
      let exitType = 'navigation';
      if (timeSpent < 3) exitType = 'bounce';
      else if (maxScrollForPage < 25) exitType = 'shallow';
      else if (maxScrollForPage > 75) exitType = 'deep_scroll';
      
      scheduleSave();
    }

    lastPageRef.current = currentPage;
    pageStartTimeRef.current = Date.now();

    if (window.performance) {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      }, 0);
    }

    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const reachedMilestones = new Set();

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        scrollDepthRef.current[currentPage] = maxScroll;
        
        scrollMilestones.forEach(milestone => {
          if (scrollPercentage >= milestone && !reachedMilestones.has(milestone)) {
            reachedMilestones.add(milestone);
            scrollEventsRef.current.push({
              page_url: currentPage,
              percentage: milestone,
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    };

    const handleClick = (e) => {
      const element = e.target.tagName;
      const text = e.target.textContent?.substring(0, 100) || '';
      const elementId = e.target.id || '';
      const elementClass = e.target.className || '';
      
      const pageNamesMap = {
        '/': 'Domovská stránka',
        '/katalog': 'Katalóg domov',
        '/detail-domu': 'Detail domu',
        '/konfigurator': 'Konfigurátor',
        '/kontakt': 'Kontakt',
        '/o-nas': 'O nás',
        '/blog': 'Blog',
        '/faq': 'Často kladené otázky',
        '/odporucanie-domov': 'AI Odporúčania domov'
      };
      const slovakPageName = pageNamesMap[window.location.pathname] || document.title;
      
      clicksRef.current.push({
        element,
        text,
        timestamp: new Date().toISOString(),
        page_url: currentPage,
        page_name_sk: slovakPageName,
        x_position: e.clientX,
        y_position: e.clientY,
        element_id: elementId,
        element_class: elementClass
      });
      
      scheduleSave();
    };

    let mouseMoveCount = 0;
    const handleMouseMove = (e) => {
      mouseMovementsRef.current++;
      mouseMoveCount++;
      
      if (mouseMoveCount % 50 === 0) {
        mouseHeatmapRef.current.push({
          x: e.clientX,
          y: e.clientY,
          page_url: currentPage
        });
        
        if (mouseHeatmapRef.current.length > 500) {
          mouseHeatmapRef.current = mouseHeatmapRef.current.slice(-500);
        }
      }
    };

    const handleFormFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        const form = e.target.closest('form');
        const formId = form?.id || form?.className || 'unknown_form';
        
        formInteractionsRef.current.push({
          form_id: formId,
          action: 'field_focus',
          timestamp: new Date().toISOString(),
          page_url: currentPage,
          fields_touched: [e.target.name || e.target.id || 'unnamed_field'],
          completed: false
        });
      }
    };

    const handleFormSubmit = (e) => {
      const formId = e.target.id || e.target.className || 'unknown_form';
      formInteractionsRef.current.push({
        form_id: formId,
        action: 'submit',
        timestamp: new Date().toISOString(),
        page_url: currentPage,
        fields_touched: [],
        completed: true
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
  }, [location.pathname]);

  // Save session data (throttled every 5 seconds)
  const scheduleSave = () => {
    if (!sessionIdRef.current) {
      console.log('⚠️ scheduleSave: Session ID neexistuje, nemôžem uložiť');
      return;
    }

    const now = Date.now();
    if (now - lastSaveRef.current < 5000 && saveTimeoutRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (!sessionIdRef.current) {
        console.log('⚠️ scheduleSave timeout: Session ID je null');
        return;
      }

      console.log('💾 Ukladám session update...', sessionIdRef.current);

      base44.entities.UserSession.filter({ session_id: sessionIdRef.current })
        .then(sessions => {
          if (sessions.length > 0) {
            const session = sessions[0];
            const currentDuration = Math.round((Date.now() - new Date(session.start_time).getTime()) / 1000);
            
            const engagementScore = Math.min(100, Math.round(
              (currentDuration / 60) * 10 +
              (clicksRef.current.length) * 2 +
              (session.pages_visited?.length || 0) * 5 +
              (Math.max(...Object.values(scrollDepthRef.current)) || 0) / 2
            ));

            const tags = [];
            if (currentDuration < 10) tags.push('odrazeny');
            else if (currentDuration > 300) tags.push('velmi_zaujaty');
            else if (currentDuration > 60) tags.push('zaujaty');
            
            const previousSessions = localStorage.getItem('user_previous_sessions');
            if (previousSessions) tags.push('vracajuci_sa');
            
            if ((session.pages_visited?.length || 0) > 5) tags.push('prieskumnik');
            if (formInteractionsRef.current.some(f => f.completed)) tags.push('konvertoval');
            if (configuratorInteractionsRef.current.length > 5) tags.push('pouzivatel_konfiguratora');

            const currentPage = window.location.pathname + window.location.search;
            const timeOnCurrentPage = pageStartTimeRef.current ? Math.round((Date.now() - pageStartTimeRef.current) / 1000) : 0;

            const updates = {
              duration_seconds: currentDuration,
              mouse_movements: mouseMovementsRef.current,
              mouse_heatmap_data: mouseHeatmapRef.current,
              scroll_depth: {
                max_percentage: Math.max(...Object.values(scrollDepthRef.current), 0),
                depths_per_page: scrollDepthRef.current
              },
              scroll_events: scrollEventsRef.current,
              clicks: clicksRef.current,
              form_interactions: formInteractionsRef.current,
              configurator_interactions: configuratorInteractionsRef.current,
              dom_interactions: domInteractionsRef.current,
              errors_encountered: errorsRef.current,
              language_changes: languageChangesRef.current,
              engagement_score: engagementScore,
              session_tags: tags,
              language: localStorage.getItem('language') || 'sk',
              last_activity: new Date().toISOString(),
              current_page: currentPage,
              is_active: true
            };

            if (lastPageRef.current) {
              const existingPages = session.pages_visited || [];
              const lastPage = existingPages[existingPages.length - 1];
              
              const pageNamesMap = {
                '/': 'Domovská stránka',
                '/katalog': 'Katalóg domov',
                '/detail-domu': 'Detail domu',
                '/konfigurator': 'Konfigurátor',
                '/kontakt': 'Kontakt',
                '/o-nas': 'O nás',
                '/blog': 'Blog',
                '/faq': 'Často kladené otázky',
                '/odporucanie-domov': 'AI Odporúčania domov'
              };
              const slovakPageName = pageNamesMap[window.location.pathname] || document.title;
              
              if (lastPage && lastPage.page_url === currentPage) {
                lastPage.time_spent_seconds = timeOnCurrentPage;
                lastPage.scroll_depth_percentage = scrollDepthRef.current[currentPage] || 0;
                lastPage.page_name_sk = slovakPageName;
                updates.pages_visited = existingPages;
              } else {
                updates.pages_visited = [
                  ...existingPages,
                  {
                    page_url: currentPage,
                    page_title: document.title,
                    page_name_sk: slovakPageName,
                    timestamp: new Date(pageStartTimeRef.current).toISOString(),
                    time_spent_seconds: timeOnCurrentPage,
                    scroll_depth_percentage: scrollDepthRef.current[currentPage] || 0,
                    exit_type: 'active'
                  }
                ];
              }
            }

            base44.entities.UserSession.update(session.id, updates)
              .then(() => {
                lastSaveRef.current = Date.now();
                console.log('💾 Session saved:', sessionIdRef.current, {
                  duration: currentDuration,
                  engagement: engagementScore,
                  clicks: clicksRef.current.length,
                  pages: updates.pages_visited?.length || 0
                });
              })
              .catch(err => console.error('❌ Session update error:', err));
          }
        })
        .catch(err => console.log('Session fetch error:', err));
    }, 3000);
  };

  // Periodic save every 30 seconds (ZMENENÉ z 10 na 30)
  useEffect(() => {
    const interval = setInterval(() => {
      scheduleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Track window online/offline
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
      if (sessionIdRef.current && lastPageRef.current && pageStartTimeRef.current) {
        const timeSpent = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
        
        base44.entities.UserSession.filter({ session_id: sessionIdRef.current })
          .then(sessions => {
            if (sessions.length > 0) {
              const session = sessions[0];
              const pages = [...(session.pages_visited || [])];
              const lastPage = pages[pages.length - 1];
              
              if (lastPage) {
                lastPage.time_spent_seconds = timeSpent;
                lastPage.exit_type = 'exit';
              }

              base44.entities.UserSession.update(sessions[0].id, {
                end_time: new Date().toISOString(),
                is_active: false,
                pages_visited: pages,
                duration_seconds: Math.round((Date.now() - new Date(session.start_time).getTime()) / 1000)
              }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Expose global tracking functions
  useEffect(() => {
    window.trackConfiguratorInteraction = (domId, domNazov, action, optionSelected, price, category) => {
      configuratorInteractionsRef.current.push({
        dom_id: domId,
        dom_nazov: domNazov,
        action: action,
        category: category,
        option_selected: optionSelected,
        price_at_time: price,
        timestamp: new Date().toISOString()
      });
      scheduleSave();
    };

    window.trackDomInteraction = (domId, domNazov, action, category) => {
      const existingInteraction = domInteractionsRef.current.find(
        i => i.dom_id === domId && i.action === action && !i.duration_seconds
      );

      if (action === 'view_start' || action === 'configurator_open') {
        domInteractionsRef.current.push({
          dom_id: domId,
          dom_nazov: domNazov,
          action: action,
          category: category,
          timestamp: new Date().toISOString(),
          duration_seconds: 0
        });
      } else if (action === 'view_end') {
        const viewStart = domInteractionsRef.current.find(
          i => i.dom_id === domId && i.action === 'view_start' && !i.duration_seconds
        );
        if (viewStart) {
          const startTime = new Date(viewStart.timestamp).getTime();
          viewStart.duration_seconds = Math.round((Date.now() - startTime) / 1000);
          viewStart.action = 'view';
        }
      }
      
      scheduleSave();
    };

    window.trackConversion = (type, data, value) => {
      scheduleSave();
    };
  }, []);

  return null;
}